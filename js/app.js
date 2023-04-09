let cliente = {
    mesa:'',
    hora:'',
    pedido:[]
}

const categorias ={
    1:'Comida',
    2:'Bebidas',
    3:'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente')
btnGuardarCliente.addEventListener('click',guardarCliente)

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value
    const hora = document.querySelector('#hora').value

    // Validacion
    const camposVasios=[mesa,hora].some(campo =>campo==='');
    if(camposVasios){
        const existeAlerta = document.querySelector('.invalid-feedback')
        
        if (!existeAlerta) {   
            const alerta = document.createElement('DIV')
            alerta.classList.add('invalid-feedback','d-block','text-center')
            alerta.textContent='Todos los campos son obligatorios'
            document.querySelector('.modal-body form').appendChild(alerta)
            
            setTimeout(() => {
                alerta.remove()
            }, 2000);
            
        }
    }else{
        cliente ={...cliente,mesa,hora}
    
    //Ocultar Modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBoostrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBoostrap.hide()

    mostrarSecciones()
    obtenerPlatos()
    }
}

function mostrarSecciones() {
    
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none')
    });
}

function obtenerPlatos() {
    const url = 'http://localhost:4000/platillos'
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatos(resultado))
}

function mostrarPlatos(resultado) {
    const contenido = document.querySelector("#platillos .contenido");
   
    resultado.forEach((platillo) => {
      const row = document.createElement("DIV");
      row.classList.add("row", "py-3", "border-top");
   
      const nombre = document.createElement("DIV");
      nombre.classList.add("col-md-4");
      nombre.textContent = platillo.nombre;
   
      const precio = document.createElement("DIV");
      precio.classList.add("col-md-3", "fw-bold");
      precio.textContent = `$${platillo.precio}`;
   
      const categoria = document.createElement("DIV");
      categoria.classList.add("col-md-3");
      categoria.textContent = categorias[platillo.categoria];
   
      const inputCantidad = document.createElement("INPUT");
      inputCantidad.type = 'number';
      inputCantidad.min = 0;
      inputCantidad.value = 0;
      inputCantidad.id = `producto-${platillo.id}`;
      inputCantidad.classList.add("form-control");
      
      //funcion para detectar cantidad y el plato agregado
      inputCantidad.onchange= function(){
        const cantidad =parseInt(inputCantidad.value)
        agregarPlato({...platillo,cantidad})
      }
   
      const agregar = document.createElement("DIV");
      agregar.classList.add("col-md-2");
      agregar.appendChild(inputCantidad);
   
      row.appendChild(nombre);
      row.appendChild(precio);
      row.appendChild(categoria);
      row.appendChild(agregar);
      contenido.appendChild(row);
    });
}
    
function agregarPlato(producto) {
    let { pedido } = cliente;
    

    if (producto.cantidad > 0 ) {
        // Elementos iguales 
        if(pedido.some( articulo =>  articulo.id===producto.id)){

            const pedidoActualizado = pedido.map(articulo => {
                if (articulo.id===producto.id) {
                    articulo.cantidad=producto.cantidad;
                }
                return articulo;
            });

            cliente.pedido=[...pedidoActualizado];
        }else{
            //agregar elemento nuevo 
            cliente.pedido=[...pedido,producto]
        }
        // articulo.id === producto.id
        

    }else{
        //Eliminar Elementos cuando la cantidad es 0 
        const resultado = pedido.filter(articulo=>articulo.id !== producto.id)
        cliente.pedido=[...resultado];
    }

    limpiarHTML()

    if (cliente.pedido.length) {
        actualizarResumen();
    }else{
        mensajePedidoVasio();
    }

}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido')

    const resumen = document.createElement('DIV')
    resumen.classList.add('col-md-6','card','py-2','px-3','shadow');

    //INFO MESA
    const mesa=document.createElement('P')
    mesa.textContent= 'Mesa : ';
    mesa.classList.add('fw-bold');

    const mesaSpan= document.createElement('span')
    mesaSpan.textContent= cliente.mesa;
    mesaSpan.classList.add('fw-normal')

    //INFO HORA
    const hora=document.createElement('P')
    hora.textContent= 'Hora : ';
    hora.classList.add('fw-bold');

    const horaSpan= document.createElement('span')
    horaSpan.textContent= cliente.hora;
    horaSpan.classList.add('fw-normal')

    //agregar elementos 
    mesa.appendChild(mesaSpan)
    hora.appendChild(horaSpan)

    //TITULO
    const heading = document.createElement('H3')
    heading.textContent = 'Platillos consumidos:'
    heading.classList.add('my-4','text-center')

    //iterar en array
    const grupo = document.createElement('UL')
    grupo.classList.add('list-group')

    const {pedido} = cliente;
    pedido.forEach(articulo=>{
        const {nombre, cantidad, precio, id} = articulo
        const lista = document.createElement('Li')
        lista.classList.add('list-group-item')

        const nombreEl = document.createElement('H4')
        nombreEl.classList.add('my-4')
        nombreEl.textContent=nombre;

        
        const cantidadEl = document.createElement('P')
        cantidadEl.classList.add('fw-bold')
        cantidadEl.textContent='Catidad: ';

        const cantidadValor=document.createElement('SPAN')
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent= cantidad

        const precioEl = document.createElement('P')
        precioEl.classList.add('fw-bold')
        precioEl.textContent='Precio: ';

        
        const precioValor=document.createElement('SPAN')
        precioValor.classList.add('fw-normal');
        precioValor.textContent= `$${precio}`

        
        const subTotalEl = document.createElement('P')
        subTotalEl.classList.add('fw-bold')
        subTotalEl.textContent='Subtotal: ';

        
        const subTotaValor=document.createElement('SPAN')
        subTotaValor.classList.add('fw-normal');
        subTotaValor.textContent= calcularSubTotal(precio,cantidad)

        //BOTON ELIMINAR
        const btnEliminar = document.createElement('BUTTON')
        btnEliminar.classList.add('btn','btn-danger')
        btnEliminar.textContent= 'Eliminar pedido';

        btnEliminar.onclick=function () {
            eliminarProducto(id)
        }

        cantidadEl.appendChild(precioValor)
        precioEl.appendChild(cantidadValor)
        subTotalEl.appendChild(subTotaValor)
        

        //Agregar elementos 
        lista.appendChild(nombreEl)
        lista.appendChild(cantidadEl)
        lista.appendChild(precioEl)
        lista.appendChild(subTotalEl)
        lista.appendChild(btnEliminar)
        
        

        grupo.appendChild(lista)

    })

    

    resumen.appendChild(heading)
    resumen.appendChild(mesa)
    resumen.appendChild(hora)
    resumen.appendChild(grupo)

    contenido.appendChild(resumen)

    formularioPropinas()
}

function mensajePedidoVasio() {
    const contenido = document.querySelector('#resumen .contenido')

    const text = document.createElement('P')
    text.classList.add('text-center')
    text.textContent='Añade los elementos del pedido'

    contenido.appendChild(text);
}

function eliminarProducto(id) {
    const {pedido}=cliente;
    const resultado = pedido.filter(articulo=>articulo.id !== id)
    cliente.pedido=[...resultado];

    limpiarHTML()
    if (cliente.pedido.length) {
        actualizarResumen()
    }else{
        mensajePedidoVasio()
    }

    // producto eliminado , cantidad 0 formulario
    const productoEliminado= `#producto-${id}`;
    const imputEliminado = document.querySelector(productoEliminado);
    imputEliminado.value=0
    
    
}

function formularioPropinas() {
    const contenido = document.querySelector('#resumen .contenido')
    
    const formulario = document.createElement('DIV')
    formulario.classList.add('col-md-6','formulario');

    const divFormulario= document.createElement('DIV')
    divFormulario.classList.add('card','py-2','px-3','shadow');


    const heading=document.createElement('H3')
    heading.classList.add('my-4','text-center')
    heading.textContent='Propina ';

    //Boton propina 10%
    const radio10 = document.createElement('INPUT')
    radio10.type='radio'
    radio10.name='propina'
    radio10.value='10'
    radio10.classList.add('form-check-input')
    radio10.onclick= calcularPropina;

    const radio10Label = document.createElement('LABEL')
    radio10Label.textContent= '10%';
    radio10Label.classList.add('form-check-label')

    const radio10Div = document.createElement('div')
    radio10Div.classList.add('form-check')

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label)

    //radio boton 25%
    
    const radio25 = document.createElement('INPUT')
    radio25.type='radio'
    radio25.name='propina'
    radio25.value='25'
    radio25.classList.add('form-check-input')
    radio25.onclick= calcularPropina;


    const radio25Label = document.createElement('LABEL')
    radio25Label.textContent= '25%';
    radio25Label.classList.add('form-check-label')

    const radio25Div = document.createElement('div')
    radio25Div.classList.add('form-check')

    radio25Div.appendChild(radio25)
    radio25Div.appendChild(radio25Label)

    //radio boton 50%
    
    const radio50 = document.createElement('INPUT')
    radio50.type='radio'
    radio50.name='propina'
    radio50.value='50'
    radio50.classList.add('form-check-input')
    radio50.onclick= calcularPropina;


    const radio50Label = document.createElement('LABEL')
    radio50Label.textContent= '50%';
    radio50Label.classList.add('form-check-label')

    const radio50Div = document.createElement('div')
    radio50Div.classList.add('form-check')

    radio50Div.appendChild(radio50)
    radio50Div.appendChild(radio50Label)


    //agregar div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //agregar formulario 
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
    
}

function calcularPropina() {
    const {pedido}=cliente
   let subtotal = 0;

   //calcular subtotal
    pedido.forEach(articulo=>{
        subtotal += articulo.cantidad * articulo.precio
    })
    //seleccionar button de propina
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value

    //calcular propnia
    const propina = ((subtotal * parseInt(propinaSeleccionada))/100);
    

    //calcular total
    const total = subtotal+propina ;
    

    mostrarTotalHTML(subtotal,total,propina)
}

function mostrarTotalHTML(subtotal,total,propina) {

    const divTotales = document.createElement('div')
    divTotales.classList.add('total-pagar','my-5')
    
    //subtotal
    const subtotalParrafo= document.createElement('P')
    subtotalParrafo.classList.add('fs-4','fw-bold','mt-2');
    subtotalParrafo.textContent= 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN')
    subtotalSpan.classList.add('fw-normal')
    subtotalSpan.textContent=`$${subtotal}`

    subtotalParrafo.appendChild(subtotalSpan)

    //propina
    const propinaParrafo= document.createElement('P')
    propinaParrafo.classList.add('fs-4','fw-bold','mt-2');
    propinaParrafo.textContent= 'Propina: ';

    const propinaSpan = document.createElement('SPAN')
    propinaSpan.classList.add('fw-normal')
    propinaSpan.textContent=`$${propina}`

    propinaParrafo.appendChild(propinaSpan)

    //total
    const totalParrafo= document.createElement('P')
    totalParrafo.classList.add('fs-4','fw-bold','mt-2');
    totalParrafo.textContent= 'Total: ';

    const totalSpan = document.createElement('SPAN')
    totalSpan.classList.add('fw-normal')
    totalSpan.textContent=`$${total}`

    totalParrafo.appendChild(totalSpan)

    //Eliminar resultado 
    const totalPagarDiv=document.querySelector('.total-pagar')
    if (totalPagarDiv) {
        totalPagarDiv.remove()
    }
    //Agregar al div
    divTotales.appendChild(subtotalParrafo)
    divTotales.appendChild(propinaParrafo)
    divTotales.appendChild(totalParrafo)

    const formulario=document.querySelector('.formulario >div')
    formulario.appendChild(divTotales);

}

function calcularSubTotal(precio,cantidad) {
    return`$ ${precio * cantidad}`;
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido')
    while (contenido.firstChild) {
        contenido.removeChild(contenido.firstChild)
    }
}