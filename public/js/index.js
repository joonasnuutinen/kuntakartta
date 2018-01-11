var ANIMATION_SPEED = 700;

// document ready
$(function() {
  var data = {};
  
  $.when(
    $.getJSON( 'json/targets.json', function(targetData) {
      data.targets = targetData;
    } ),
    
    $.getJSON( 'json/eventTargets.json', function(eventTargetData) {
      data.eventTargets = eventTargetData;
    } )
  ).then( function() {
    var targets = [];
    
    data.targets.forEach( function(targetObject) {
      targets.push( new Target( targetObject ) );
    } );
    
    /*var eventTargets = [
      {
        map: 'kunta',
        expires: null,
        type: 'custom',
        customHtml: '<span class="index map-index" id="map-target-38" data-target="38" style="top: 75.5%; left: 47.2%"><div>38</div></span>'
      },
      {
        name: 'Rautatieasema',
        map: 'keskusta',
        url: 'https://msl.fi/karhufestivaali/',
        coord: [64.6, 46.6],
        expires: new Date('2017-08-27T00:00:00+03:00')
      },
      {
        name: 'Festivaalialueet',
        map: 'keskusta',
        url: 'https://msl.fi/karhufestivaali/',
        coord: [50.2, 23.8],
        expires: new Date('2017-08-27T00:00:00+03:00'),
        circles: [
          {
            center: [48.5, 28.3],
            size: 3.7
          },
          {
            center: [42.3, 14.8],
            size: 3.0
          },
          {
            center: [44.2, 29.5],
            size: 3.0
          },
          {
            center: [47.5, 33.0],
            size: 2.8
          },
          {
            center: [61.6, 28.5],
            size: 2.0
          }
        ]
      }
    ];*/
    
    var listObject = new List();
    var maps = [
      new Map('keskusta', 'Ilomantsin keskustan kartta', [49.4, 32.5], 0.35, 0.4, 5000, 5000),
      new Map('kunta', 'Ilomantsin kunnan kartta', [48.5, 70.2], 0.0, 0.6, 2500, 2500)
    ];

    $.each(targets, function(key, val) {
      listObject.addTarget(val);
      /*$.each(maps, function(key2, val2) {
        val2.addTarget(val);
      });*/
    });
    /*
    $.each(data.eventTargets, function(key, val) {
      $.each(maps, function(key2, val2) {
        val2.addEventTarget(val);
      });
    });
    */
    listObject.listHtml();
    /*var mapWindow = new MapView(maps);
    mapWindow.setMap(0);
    
    mapEvents(listObject, mapWindow);*/
    
    renderMap();
  } );
  
  /*var targets = [
    new Target('Hyvinvointikeskus Toivonlahti', 'keskusta', [19.6, 23.2], 'Henrikintie 4', 'neuvonta 0400 357200', null, 'www.linklife.fi', 'https://www.facebook.com/Hyvinvointikeskus-Toivonlahti-148225018603293/', false),
    new Target('Lähimmäispalvelukeskus Iljala', 'keskusta', [28.6, 36.6], 'Kappalaisentie 2', '040 7787502', null, null, 'https://www.facebook.com/L%C3%A4himm%C3%A4ispalvelukeskus-Iljala-ry-1751284958459013/', false),
		new Target('Hermannin Viinitorni', 'keskusta', [30.6, 35.2], 'Kappalaisentie 2', '020 7789233', 'Auki kesäisin.', null, 'https://www.facebook.com/pages/Hermannin-Viinitorni/233058680063731', false),
    new Target('Hermannin Viinitila', 'keskusta', [42.1, 51.4], 'Käymiskuja 1', '020 7789230', null, 'hermannin.fi', 'https://www.facebook.com/hermanninviinitila/', false),
    new Target('Fysiokeskus Ikiliikkuja', 'keskusta', [40, 27.6], 'Kauppatie 51', '0400 982942', null, null, 'https://www.facebook.com/Fysiokeskus-Ikiliikkuja-Oy-1119224178097452/', false),
    new Target('Kauneus- ja jalkahoitola Aune Matero', 'keskusta', [41.1, 26.7], 'Kauppatie 49', '040 5373935', null, null, null, false),
    new Target('Hieronta- ja liikuntapalvelut Saija Lauronen', 'keskusta', [44.4, 25.4], 'Kalevalantie 25', '045 2140804', null, 'www.hierontajaliikuntapalvelut.com', 'https://www.facebook.com/hierontajaliikunta/', false),
    new Target('Ravintola Taj Mahal', 'keskusta', [44.4, 26], 'Kalevalantie 25', '046 9053245, 040 1473341', 'Avoinna ma–su 10.00–22.00.', null, 'https://www.facebook.com/pages/Ravintola-Taj-Mahal/1665208343789804', false),
    new Target('Ravintola Murginapirtti', 'keskusta', [44.4, 17.2], 'Katri Valan tie 1', '040 5848386', null, 'www.murginapirtti.fi', null, false),
    new Target('Ilomantsin Fysikaalinen Hoitolaitos', 'keskusta', [47.1, 25.4], 'Kauppatie 32', '050 5522044', null, null, null, false),
    new Target('Pogostan Kaluste', 'keskusta', [45.2, 26.8], 'Kalevalantie 23', '0400 150591', null, 'www.pogostankaluste.fi', null, false),
    new Target('Ilomantsin kirjakauppa', 'keskusta', [45.8, 27.4], 'Kalevalantie 21', '013 881844', null, null, null, false),
    new Target('Fysio-Voimala', 'keskusta', [46.3, 27.9], 'Kalevalantie 21', '050 5591222', null, 'www.fysiovoimala.com', 'https://www.facebook.com/fysiovoimala/', false),
    new Target('Karjalan Rakentajat', 'keskusta', [45.2, 29.5], 'Kalevalantie 22', '0400 174981', null, 'www.karjalanrakentajat.fi', null, false),
    new Target('Sähköasennus Virtanen', 'keskusta', [45.2, 29.5], 'Kalevalantie 22', '045 1344264', null, 'www.sahkoasennusvirtanen.fi', 'https://www.facebook.com/sahkoasennus.virtanen.oy/', true),
    new Target('Mantsin Kehys', 'keskusta', [47.6, 31.8], 'Kalevalantie 18 B', '013 881597', null, null, 'https://www.facebook.com/mantsinkehysoy/', false),
    new Target('OP Vaara-Karjala', 'keskusta', [48.1, 32.7], 'Mantsintie 5', '010 256 3401', null, 'www.op.fi', 'https://www.facebook.com/OP.vaarakarjala', false),
		new Target('Ilomantsin Nukke- ja nalletalo', 'keskusta', [48.9, 26.3], 'Kauppatie 30', '040 7787502', null, null, 'https://www.facebook.com/IlomantsinNukkeJaNalletalo/', false),
		new Target('Pogostan Sanomat', 'keskusta', [52.08, 27.12], 'Kauppatie 29', '010 2308800', null, 'www.pogostansanomat.fi', 'https://www.facebook.com/PogostanSanomat/', false),
    new Target('Ilomantsin Optiikka', 'keskusta', [50.8, 30.2], 'Mantsintie 1–3', '050 3038952', null, null, 'https://www.facebook.com/Ilomantsin-Optiikka-156705274507501/', false),
    new Target('Taukoherkut', 'keskusta', [51.0, 30.6], 'Mantsintie 1–3', '040 5607325', null, 'www.taukoherkut.fi', 'https://www.facebook.com/taukoherkut/', false),
    new Target('Ravintola Mendin', 'keskusta', [51.7, 30.7], 'Mantsintie 1–3', '013 881424', null, 'www.mendin.fi', 'https://www.facebook.com/ravintolamendin/', false),
    new Target('Ilomantsin apteekki', 'keskusta', [47.7, 34.1], 'Mantsintie 8', '013 881424', null, 'www.ilomantsinapteekki.fi', null, false),
    new Target('Tili- ja kiinteistötoimisto Tili-Talo', 'keskusta', [50.2, 34.7], 'Kalevalantie 14', '040 3000720', null, 'www.tilitalo.fi', null, false),
    new Target('Jalkahoitola ElämysMantsi', 'keskusta', [50, 34.7], 'Kalevalantie 14', '040 5076623', null, null, 'https://www.facebook.com/Elämysmantsi-Oy-687472537943653/', false),
    new Target('Pogostan Tietoverkkopalvelut', 'keskusta', [50.6, 35.2], 'Kalevalantie 14', '0400 101481', null, 'www.tietoverkkopalvelut.palvelee.fi', 'https://www.facebook.com/PogostanTVP/', false),
    new Target('Hotelli Pogostan Hovi', 'keskusta', [51.5, 36.1], 'Kalevalantie 12', '040 1964496', null, 'www.hotellipogostanhovi.fi', 'https://www.facebook.com/hotellipogostanhovi/', false),
    new Target('Ilomantsin Leipomo', 'keskusta', [52.4, 37.4], 'Kalevalantie 10', '013 881273', null, 'www.ilomantsinleipomo.fi', 'https://www.facebook.com/pages/Ilomantsin-Leipomo/133655036777235', false),
    new Target('Kesport-Kenkä-Tekstiili Kortelainen', 'keskusta', [53.7, 36.0], 'Kalevalantie 11', '0400 264100', null, null, 'https://www.facebook.com/KesportIlomantsi/', false),
    new Target('K-Market Ilomantsi', 'keskusta', [54.4, 36.7], 'Kalevalantie 11', '013 882733', null, null, 'https://www.facebook.com/K-market-Ilomantsi-1403093716680908/', false),
    new Target('Kukka- ja hautauspalvelu Hassinen', 'keskusta', [55.1, 34.9], 'Mäkitie 10', '013 881017', null, null, null, false),
    new Target('Salakan Puutarha ja Hautauspalvelu', 'keskusta', [57.7, 36.1], 'Ruskosillantie 8', '013 881055', null, 'www.salakanpuutarha.fi', 'https://www.facebook.com/Salakan-Puutarha-ja-hautauspalvelu-449221185115927/', false),
    new Target('Mantsin Rauta-Sport Laatikainen', 'keskusta', [54.3, 39.7], 'Kalevalantie 6', '010 2291510', null, 'www.mantsinrautasport.fi', 'https://www.facebook.com/Mantsin-Rauta-Sport-Laatikainen-181789555279709/', false),
    new Target('Neste Ilotuuli', 'keskusta', [57.3, 42.6], 'Kalevalantie 2', '0400 892877', null, null, 'https://www.facebook.com/profile.php?id=100010873772590', false),
    new Target('Kone- ja Autotarvike Tanskanen', 'keskusta', [61.3, 45.6], 'Asematie 6', '0400 793973', null, null, 'https://www.facebook.com/Kone-ja-Autotarvike-Tanskanen-Oy-1546591075637043/', false),
    new Target('Mottimaja', 'keskusta', [64.8, 6.2], 'Pogostantie 44', '013 220511', null, 'www.mottimaja.fi', 'https://www.facebook.com/Mottimaja-124271687660191/', false),
    new Target('Ravintola Parppeinpirtti', 'keskusta', [59.1, 73.4], 'Parppeintie 4', '010 2399950', null, 'www.parppeinpirtti.fi', 'https://www.facebook.com/parppeinpirtti/', false),
    new Target('Parppeinvaaran runokylä', 'keskusta', [61.6, 74.6], 'Parppeintie 4 C', '050 3758787', null, 'www.parppeinvaara.fi', 'https://www.facebook.com/Parppeinvaara/', false),
    new Target('Anssilan Maatila', 'keskusta', [33.5, 98.6], 'Anssilantie 7', '040 5431526', null, 'www.anssila.fi', 'https://www.facebook.com/Anssila/', false),
    new Target('Erämatkailukeskus Käenkoski', 'kunta', [51.1, 9.1], 'Naarvantie 194 B', '040 7396384', null, 'www.kaenkoski.info', null, false),
    new Target('Taistelijan Talo', 'kunta', [89.2, 6.3], 'Hatuntie 387 A', '0400 273671', null, 'www.taistelijantalo.fi', 'https://www.facebook.com/taistelijantalo/', false),
    new Target('ElämysMantsi', 'kunta', [14.9, 68.9], 'Ykshongantie 53', '040 5076623', null, 'www.elamysmantsi.fi', 'https://www.facebook.com/Elämysmantsi-Oy-687472537943653/', false),
    new Target('Maukkulan Mustikkamäki', 'kunta', [41.2, 86.3], 'Toukka-ahontie 9', '040 7403002', 'Talvisin auki tilauksesta.', 'www.maukkulanmustikkamaki.fi', 'https://www.facebook.com/Maukkulan-Mustikkamäki-Oy-276660950347/', false),
    
    new Target('Arskan Kone Oy', 'kunta', [57.0, 61.3], 'Hatuntie 50 C', '0500 273422', null, 'www.arskankoneoy.fi', 'https://www.facebook.com/Arskan-Kone-Oy-946932635395345/', false),
    
    new Target('Kuuksenkaari', 'kunta', [57.8, 80.3], 'Kuuksenvaarantie 20', '050 5602844', null, 'www.kuuksenkaari.fi', null, false),
    
    new Target('MyllyMatti', 'kunta', [59.2, 64.3], 'Karvilantie 18', '040 7028933', null, 'www.myllymatti.com', 'https://www.facebook.com/myllymatti/', false),
    
    new Target('Möhkön Manta / Mantan Majatalo', 'kunta', [88.6, 78.4], 'Möhköntie 210 / Möhkönraitti 3 A', '040 8616373', null, 'www.mohkonmanta.net', 'https://www.facebook.com/Möhkön-Manta-281857105210435/', false),
    new Target('Möhkön Ruukkimuseo', 'kunta', [90.9, 78], 'Möhköntie 209', '050 3428825', null, 'www.mohkonruukki.fi', 'https://www.facebook.com/mohkon.ruukki/', false),
    new Target('Möhkön Rajakartano', 'kunta', [91.7, 77.7], 'Mustakorventie 11', '0500 649150', null, 'rajakartano.com', 'https://www.facebook.com/Möhkön-Rajakartano-549237105127366/', false)
  ];*/
}); // $(document).ready

function renderMap() {
  var map = new ol.Map( {
    target: 'map-div',
    layers: [
      new ol.layer.Tile( {
        source: new ol.source.OSM()
      } )
    ],
    view: new ol.View( {
      center: ol.proj.fromLonLat( [30.9327, 62.6716] ),
      zoom: 14
    } )
  } );
}

function MapView(maps) {
  var cont = $(".map-container");
  this.viewWidth = cont.width();
  this.viewHeight = cont.height();
  this.maps = maps;
  this.active = 0;
  this.mapWidth = 0.0;
  this.mapHeight = 0.0;
  this.mapViewWidth = 0.0;
  this.mapViewHeight = 0.0;
  this.center = [50.0, 50.0];
  this.zoom = 0.1;
  this.minZoom = 0.1;
  this.firstIndexes = [];

  this.setFirstIndexes = function() {
    var counter = 1;
    var indexes = [];
    $.each(this.maps, function(key, val) {
      val.firstIndex = counter;
      indexes.push(counter);
      counter += val.targets.length;
    });
    this.firstIndexes = indexes;
  };

  this.setMinZoom = function() {
    var minZoomX = this.viewWidth / this.maps[this.active].mapWidth;
    var minZoomY = this.viewHeight / this.maps[this.active].mapHeight;
    if (minZoomX > minZoomY) {
      this.minZoom = minZoomX;
    } else {
      this.minZoom = minZoomY;
    }
  };

  this.setZoom = function(zoom) {
    this.zoom = fitToRange(zoom, this.minZoom, 1.0);
  };

  this.setCenter = function(center) {
    this.center = [fitToRange(center[0], 0, 100), fitToRange(center[1], 0, 100)];
  };

  this.setView = function(a) {
    var animate = (typeof a !== 'undefined' ? a : true);
    this.mapViewWidth = this.mapWidth * this.zoom;
    this.mapViewHeight = this.mapHeight * this.zoom;
    var bottomPx = this.center[1] / 100 * this.mapViewHeight;
    var rightPx = this.center[0] / 100 * this.mapViewWidth;

    bottomPx -= this.viewHeight / 2;
    rightPx -= this.viewWidth / 2;
    bottomPx = fitToRange(bottomPx, 0, this.mapViewHeight - this.viewHeight);
    rightPx = fitToRange(rightPx, 0, this.mapViewWidth - this.viewWidth);

    if(animate) {
      $(".map").animate({
        right: rightPx + "px",
        bottom: bottomPx + "px",
        width: this.mapViewWidth + "px",
        height: this.mapViewHeight + "px"
      }, ANIMATION_SPEED);
    } else {
      $(".map").css({
        right: rightPx + "px",
        bottom: bottomPx + "px",
        width: this.mapViewWidth + "px",
        height: this.mapViewHeight + "px"
      });
    }
  };

  this.toggleHtml = function() {
    var active = this.active;
    var html = '';
    $.each(this.maps, function(key, val) {
      if (key !== active) {
        html += '<button class="btn btn-default toggle" type="button" id="toggle-map" data-map="' + key + '" data-first-index="' + val.firstIndex + '">' + val.toggleContent() + '</button>';
      }
    });
    $('.toggle-buttons').html(html);
  };

  this.setMap = function(i) {
    this.setFirstIndexes();
    var map = this.maps[i];
    this.active = i;
    map.mapHtml();
    this.toggleHtml();
    this.mapWidth = map.mapWidth;
    this.mapHeight = map.mapHeight;
    this.setCenter(map.initCenter);
    this.setMinZoom();
    this.setZoom(map.initZoom);
    this.setView();
  };

  this.zoomMap = function(direction) {
    var amount = 2.0;
    if (direction === 'out') {
      amount = 0.5;
    }
    this.setZoom(this.zoom * amount);
    this.setView();
  };

  this.moveMap = function(direction) {
    var step = 5;
    var deltaX = 0;
    var deltaY = 0;
    switch (direction) {
      case 'up':
        deltaY = -step;
        break;
      case 'right':
        deltaX = step;
        break;
      case 'down':
        deltaY = step;
        break;
      case 'left':
        deltaX = -step;
    }
    var newCenter = [this.center[0] + deltaX, this.center[1] + deltaY];
    this.setCenter(newCenter);
    this.setView();
  };

  this.resize = function() {
    this.viewWidth = cont.width();
    this.viewHeight = cont.height();
    this.setMinZoom();
    this.setZoom(this.zoom);
    this.setView(false);
  };

  this.moveTo = function(target) {
    var i = 1;
    var len = this.firstIndexes.length;
    while (i < len) {
      if (target < this.firstIndexes[i]) {
        break;
      }
      i++;
    }
    i--;
    if (i !== this.active) {
      this.setMap(i);
    }
    var index = target - this.firstIndexes[i];
    var newCenter = this.maps[i].targets[index];
    var newZoom = this.maps[i].focusZoom;
    this.setCenter(newCenter);
    if (newZoom > this.zoom) {
      this.setZoom(newZoom);
    }
    this.setView();
  };
}

function Map(name, alt, initCenter, initZoom, focusZoom, mapWidth, mapHeight) {
  this.name = name;
  this.src = 'images/' + name + '.png';
  this.thumbnail = 'images/' + name + '-thumb.jpg';
  this.alt = alt;
  this.initCenter = initCenter;
  this.initZoom = initZoom;
  this.focusZoom = focusZoom;
  this.mapWidth = mapWidth;
  this.mapHeight = mapHeight;
  this.targets = [];
  this.eventTargets = [];
  this.firstIndex = 1;

  this.addTarget = function(targ) {
    if (!targ.sub && targ.map === this.name) {
      this.targets.push(targ.mapPercent);
    }
  };
  
  this.addEventTarget = function(eTarg) {
    var now = new Date();
    if (eTarg.map == this.name && (eTarg.expires === null || now < eTarg.expires)) {
      this.eventTargets.push(eTarg);
    }
  };

  this.mapHtml = function() {
    var firstIndex = this.firstIndex;
    var html = '<img src="' + this.src + '" id="map-img" width="' + this.mapWidth + '" height="' + this.mapHeight + '" alt="' + this.alt + '" draggable="false">';

    $.each(this.targets, function(key, val) {
      var i = firstIndex + key;
      html += '<span class="index map-index" id="map-target-' + i + '" data-target="' + i + '" style="top: ' + val[1] + '%; left: ' + val[0] + '%;"><div>' + i + '</div></span>';
    });
    
    $.each(this.eventTargets, function(key, val) {
      if (val.type = 'custom') {
        html += val.customHtml;
      } else {
        html += '<a class="event-display" href="' + val.url + '" style="top: ' + val.coord[1] + '%; left: ' + val.coord[0] + '%;" target="_blank"><div>' + val.name + '</div></a>';
        
        $.each(val.circles, function(key2, circle) {
          html += '<div class="circle" style="top: ' + circle.center[1] + '%; left: ' + circle.center[0] + '%; width: ' + circle.size + '%; height: ' + circle.size + '%;"></div>';
        });
      }
    });
    
    $('#map-div').html(html);
  };

  this.toggleContent = function() {
    var toggleSize = 80;
    var html = '<img src="' + this.thumbnail + '" alt="' + alt + '" width="' + toggleSize + '" height="' + toggleSize + '"><span>' + this.name + '</span>';
    return html;
  };
}

function List() {
  this.targets = [];

  this.addTarget = function(targ) {
    if (!targ.sub) {
      this.targets.push([targ]);
    } else {
      var n = this.targets.length;
      this.targets[n - 1].push(targ);
    }
  };

  this.listHtml = function() {
    var targs = this.targets;
    var html = '';
    $.each(targs, function(key, val) {
      var i = key + 1;
      html += '<div class="target" id="target-' + i + '" data-target="' + i + '" data-left="' + val[0].mapPercent[0] + '" data-top="' + val[0].mapPercent[1] + '"><div class="list-index-container"><span class="index"><div>' + i + '</div></span></div><!-- .list-index-container -->';
      $.each(val, function(key2, val2) {
        html += val2.targetHtml();
      });
      html += '</div><!-- .target -->';

    });
    $("#list").html(html);
  };
  
  this.scrollTo = function(i) {
    var offsetZero = $('#target-1').offset().top;
    var targetId = '#target-' + i.toString();
    var offsetTop = $(targetId).offset().top - offsetZero;
    $('.list-container').animate({
      scrollTop: offsetTop
    }, ANIMATION_SPEED);
  };
}

function Target(targetObject) {
  this.map = targetObject.map;
  this.name = targetObject.name;
  this.phone = targetObject.phone;
  this.url = targetObject.url;
  this.address = targetObject.address;
  this.info = targetObject.info;
  this.url = targetObject.url;
  this.fb = targetObject.fb;
  this.sub = targetObject.sub;
  this.mapPercent = targetObject.mapPercent;

  this.itemHtml = function(value, type, attributes) {
    if (!value) {
      return '';
    } else {
      var targetAttr = '';
      for (var attr in attributes) {
        if (attr == 'customValue') {
          value = attributes.customValue;
        } else {
          targetAttr += ' ' + attr + '="' + attributes[attr] + '"';
        }
      }
      var targetHtml = ' <' + type + targetAttr + '>' + value + '</' + type + '>';
      return targetHtml;
    }
  };

  this.targetHtml = function() {
    var subClass = (this.sub) ? ' sub' : '';
    var html = '<div class="list-text-container' + subClass + '"><h3 class="name">' + this.name + '</h3><p><span class="phone">' + this.phone + '</span>';

    html += this.itemHtml(this.address, 'span', {
      class: 'address'
    });

    html += this.itemHtml(this.info, 'span', {
      class: 'info'
    });

    html += this.itemHtml(this.url, 'a', {
      class: 'url',
      href: 'http://' + this.url,
      target: '_blank'
    });

    html += this.itemHtml(this.fb, 'a', {
      href: this.fb,
      class: 'facebook',
      target: '_blank',
      customValue: '<img src="images/fb-logo.png" class="fb-logo" width="15" height="15" alt="Facebook Logo">'
    });

    html += '</p></div><!-- .list-text-container -->';
    return html;
  };
}

function fitToRange(value, min, max) {
  if (value <= min) {
    return min;
  } else if (value < max) {
    return value;
  } else {
    return max;
  }
} // function fitToRange

function mapEvents(listObject, mapWindow) {
  $('.zoom').on('click', function() {
    var direction = $(this).attr('data-action');
    mapWindow.zoomMap(direction);
  });

  $(".move-button").on('click', function() {
    var direction = $(this).attr('data-action');
    mapWindow.moveMap(direction);
  }); // .move-button click

  $('.toggle-buttons').on('click', '.toggle', function() {
    $(".target").removeClass("active");
    var i = parseInt($(this).attr('data-map'));
    var firstIndex = parseInt($(this).attr('data-first-index'));
    mapWindow.setMap(i);
    listObject.scrollTo(firstIndex);
  });

  $('#list').on('click', '.target', function() {
    var i = $(this).attr('data-target');
    mapWindow.moveTo(i);
    var mapTargetId = '#map-target-' + i;
    $(".target").removeClass("active");
    $(".index").removeClass('active');

    $(this).addClass("active");
    $(mapTargetId).addClass("active");
  });

  $("#list").on("mouseover", ".target", function() {
    var mapTargetId = '#map-target-' + $(this).attr('data-target');
    $(mapTargetId).addClass('hover');
  }); // #list on mouseover

  $("#list").on("mouseout", ".target", function() {
    var mapTargetId = '#map-target-' + $(this).attr('data-target');
    $(mapTargetId).removeClass('hover');
  }); // #list on mouseout

  $('#map-div').on('mouseover', '.index', function() {
    var targetId = '#target-' + $(this).attr('data-target');
    $(targetId).addClass('hover');
  }); // #map-div on mouseover

  $('#map-div').on('mouseout', '.index', function() {
    var targetId = '#target-' + $(this).attr('data-target');
    $(targetId).removeClass('hover');
  }); // #map-div on mouseout

  $('#map-div').on('click', '.index', function() {
    var i = $(this).attr('data-target');
    listObject.scrollTo(parseInt(i));
    var targetId = '#target-' + i;
    $(targetId).trigger('click');
  }); // #map-div on click

  $(window).on('resize', function() {
    mapWindow.resize();
  }); // window on resize
}

function eventDisplay(name, url, coord, expiration) {
  var now = new Date();
  if(now < expiration) {
    var eventHtml = '<a class="event-display" href="' + url + '" style="top: ' + coord[1] + '%; left: ' + coord[0] + '%;" target="_blank"><div>' + name + '</div></a>';
    $('#map-div').append(eventHtml);
  }
}