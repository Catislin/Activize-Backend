
$(document).ready(() => {

  //=============CONNECT TO SOCKET==============
  let socket = io.connect();


  //==========================NEW REQUESTS=========================
  addNewRequest = (request) => {
    console.log(request);
    let newRequestClone = $('.request-prototype').clone(true);
    newRequestClone.addClass('request').removeClass('request-prototype');
    newRequestClone.find('#requestTitle').text(request.name);
    newRequestClone.find('#requestPayout').text('$'+request.payout);
    newRequestClone.appendTo('.requestsContainer');
  }


//========================SITE BUTTONS===========================

  //Toggle making a new Hap
  $('.newRequestBtn').click(() => {
    let hapFormContainerDisplay = $('.requestFormContainer').css('display');
    if(hapFormContainerDisplay == 'none'){
      $('.requestFormContainer').css('display', 'flex');
      $('.requestForm').css('display', 'flex');
    }else{
      $('.requestFormContainer').css('display', 'none');
      $('.requestForm').css('display', 'none');
    }
  });

  //Refresh Page
  $('.brand').click(() => {
    location.reload();
  });


//============HAP FORM FUNCTONALITY===================
//Submit New Hap
$('#newRequestSubmit').click(() => {
  let newRequestData = {
    name : $('#newRequestTitle').val(),
    description : $('#newRequestBody').val(),
  };
  $('.requestFormContainer').css('display', 'none');
  $('.requestForm').css('display', 'none');
  socket.emit('New Hap', {hap : newRequestData})
});
//Close Form
$('#requestFormCloseBtn').click(() => {
  $('.requestFormContainer').css('display', 'none');
  $('.requestForm').css('display', 'none');
})
//Update Hap Title
$('#newRequestTitle').keypress((e) => {
  if(e.key != 'enter'){
    $('.newRequestLabel').text($('#newRequestTitle').val() + e.key);
  }
})
$('#newRequestTitle').keydown((e) => {
  if(e.key == 'Backspace'){
    $('.newRequestLabel').text($('.newRequestLabel').text().substr(0,$('.newRequestLabel').text().length - 1));
  }
})


//==================SOCKETS HANDLERS===================
  socket.on('New Hap', (d) => {
    addNewRequest(d.hap);
  })

})
