function divElementEnostavniTekst(sporocilo) {
  var slika = sporocilo.search(new RegExp(/(https?:\/\/[^\s]*\.(jpg|png|gif))/gi)) > -1;
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;

  var video = sporocilo.search(/https:\/\/www\.youtube.com\/watch\?v=.*/gi) > -1;
  var yt = sporocilo.search(/(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)/gi) > -1;
  

  if (jeSmesko) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else if (slika) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />').replace
    (new RegExp(/(https?:\/\/[^\s]*\.(jpg|png|gif))/g), "<img src='$1' width='200px' style='margin-left: 20px;'/>");
     return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else if (video) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/https:\/\/www.youtube.com\/watch\?v=([\w-=]+)/g, '<iframe style ="width:200px; height=150px; margin-left:20px" src="https://www.youtube.com/embed/$1" allowfullscreen> </iframe>')

  } else if (yt) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/(https:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9]+))/gi), '<iframe style="width:200px; height:150px; margin-left:20px;" src="https://www.youtube.com/embed/$1" allowfullscreen></iframe>';
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
}


/*function slike(vhodnoBesedilo) {
=======

/* function slike(vhodnoBesedilo) {
>>>>>>> dregljaj
  var seznamSmeskov = ["wink.png", "smiley.png", "like.png", "kiss.png", "sad.png"];
  var image = vhodnoBesedilo.toString();
  for (var i in image) {
    if (image[i] == seznamSmeskov[i]) {
      vhodnoBesedilo = vhodnoBesedilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    }
  }
  vhodnoBesedilo = vhodnoBesedilo.replace(/(https?:\/\/[^\s]*\.(?:jpg|png|gif))/gi, "<img src='$1' width='200px' style='margin-left: 20px;' />" );
  return vhodnoBesedilo;
<<<<<<< HEAD
}*/


function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;
  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j=0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
  });
  
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    $('#seznam-uporabnikov div').click(function() {
        $('#poslji-sporocilo').val('/zasebno \"' + $(this).text() + '\" ').focus();
    })
  });
  
  socket.on('dregljaj', function(rezultat) {
      if (rezultat.dregljaj) {
        $('#vsebina').trigger('startRumble');
        setTimeout(function() {$('#vsebina').trigger('stopRumble');}, 1500);
      }
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
  
  
});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}
