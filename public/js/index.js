const ANIMATION_SPEED = 600;
const IN_ZOOM = {
  keskusta: 16,
  kunta: 11
 };
const INIT_ZOOM = 14;
const FA = {
  'Terveys ja liikunta': 'fas fa-heart',
  'Ravintolat ja kahvilat': 'fas fa-utensils',
  'Museot ja nähtävyydet': 'fas fa-paint-brush',
  'Kaupat ja myymälät': 'fas fa-shopping-cart'
};

var Filter = {
  init: function( $target, map ) {
    var t = this;
    
    t.optionList = $( '<ul>' )
      .addClass( 'filter__list' )
      .appendTo( $target );
    
    $target
      .find( '.js-filter__button' )
      .click( function filterButtonClicked() {
        t.toggleOptions();
      } );
    
    t.addOption( 'Näytä kaikki', true );
    t.target = $target;
    t.map = map;
  },
  
  toggleOptions: function() {
    this.optionList.slideToggle();
  },
  
  addOption: function( optionName, showAll ) {
    // todo: instead of adding to the list, add to array `this.options` alphapetically
    
    var t = this;
    
    var $option = $( '<li>' )
      .addClass( 'filter__option' )
      .text( optionName )
      .click( function optionClicked() {
        if ( showAll ) {
          t.map.showAllTargets();
        } else {
          t.map.hideAllTargets();
          // show matching targets
        }
        
      } )
      .appendTo( t.optionList );
  },
  
  addOptionsToList: function() {
    // todo: add each option in `this.options` to the list as in `this.addOption()`
  }
};

var Preview = {
  init: function( $target ) {
    this.target = $target;
  },
  
  show: function( $listTarget, $additionalContent ) {
    var $preview = this.target;
    var previewHeight;
    var $expandButton = $( '<span>' )
      .addClass( 'expand-preview' )
      .html( '<i class="fas fa-chevron-up"></i>' )
      .click( function expandButtonClicked() {
        $( this )
          .css( 'transform', 'rotateX(180deg)' )
          .off( 'click' )
          .click( function collapseButtonClicked() {
            
            $preview
              .removeClass( 'preview--expanded' )
              .animate( {
                height: previewHeight
              }, ANIMATION_SPEED );
            
            $( this )
              .css( 'transform', 'rotateX(0)' )
              .off( 'click' )
              .click( expandButtonClicked );
          } );
        
        
        $preview
          .addClass( 'preview--expanded' )
          .animate( {
            height: '100%'
          }, ANIMATION_SPEED );
        
      } );
    
    var $previewTarget = $listTarget
      .clone()
      .attr( 'id', 'preview-target' )
      .removeClass( 'active hover' )
      .append( $expandButton );
    
    $preview
      .html( $previewTarget )
      .append( $additionalContent )
    
    previewHeight = $previewTarget.innerHeight();

    $preview.animate( {
      height: previewHeight + 'px'
    }, ANIMATION_SPEED, function animationDone() {
      $( this ).find( '.js-additional-content' ).show();
    } );
  },
  
  hide: function() {
    this.target
      .animate( { 
        height: 0
      }, ANIMATION_SPEED, function previewHidden() {
        $( this ).html( '' );
      } );
  }
};

var Map = {
  init: function(center, zoom, target) {
    var t = this;
    
    this.map = new ol.Map( {
      target: target,
      layers: [
        new ol.layer.Tile( {
          source: new ol.source.OSM()
        } )
      ],
      view: new ol.View( {
        center: ol.proj.fromLonLat( center ),
        zoom: zoom
      } )
    } );
    
    this.map.on( 'click', function mapClicked() {
      t.preview.hide();
      t.resetActiveTargets();
    } );
    
    t.target = $( '#' + target );
  },
  
  addTarget: function(targetObject, inZoom) {
    var index = targetObject.index;
    var position = targetObject.location.slice();
    position.push( position.shift() );
    var pos = ol.proj.fromLonLat( position );
    var markerId = 'map-target-' + index;
    var t = this;
    var targetHtml = '<i class="' + FA[targetObject.branch] + '"></i>';
    
    var targetElement = $( '<div>' )
      .addClass( 'index map-index' )
      .attr( {
        id: markerId,
        'data-target': index
      } )
      .html( targetHtml )
      .click( function mapTargetClicked(e, disableScroll) {
        var $listTarget = $( '#target-' + index );
        var $additionalContent = t.listObject.targets[index - 1][0].additionalContent();
        
        if ( ! disableScroll ) {
          t.listObject.scrollTo( index );
        }
        
        t.map.getView().animate( { zoom: inZoom, center: pos, duration: ANIMATION_SPEED } );
        
        t.resetActiveTargets();
        $( this ).addClass( 'active' );
        $listTarget.addClass( 'active' );

        t.preview.show( $listTarget, $additionalContent );
      } )
      .get( 0 );
    
    var marker = new ol.Overlay( {
      position: pos,
      positioning: 'center-center',
      element: targetElement,
      stopEvent: true
    } );
    this.map.addOverlay( marker );
  },
  
  addEventTarget: function(eventTargetObject, inZoom) {
    var index = eventTargetObject.index;
    var position = eventTargetObject.location.slice();
    position.push( position.shift() );
    var pos = ol.proj.fromLonLat( position );
    var markerId = 'map-event-target-' + index;
    var t = this;
    
    var eventTargetElement = $( '<div>' )
      .addClass( 'event-display' )
      .attr( {
        id: markerId,
        'data-event-target': index
      } )
      .text( eventTargetObject.name )
      .click( function mapEventTargetClicked(e, disableScroll) {
        if ( ! disableScroll ) {
          t.listObject.scrollTo( index, true );
        }
        t.map.getView().animate( { zoom: inZoom, center: pos, duration: ANIMATION_SPEED } );
        
        $( '.index, .target, .event-display' ).removeClass( 'active' );
        
        $( this ).addClass( 'active' );
        $( '#event-target-' + index ).addClass("active");
      } )
      .get( 0 );
    
    var marker = new ol.Overlay( {
      position: pos,
      positioning: 'center-center',
      element: eventTargetElement,
      stopEvent: false
    } );
    this.map.addOverlay( marker );

  },
  
  connectList: function( listObject ) {
    this.listObject = listObject;
  },
  
  connectPreviewArea: function( $target ) {
    this.preview = Object.create( Preview );
    this.preview.init( $target );
  },
  
  resetActiveTargets: function() {
    $( '.index, .target, .event-display' ).removeClass( 'active' );
  },
  
  hideAllTargets: function() {
    this.target.find( '.index' ).hide();
  },
  
  showAllTargets: function() {
    this.target.find( '.index' ).show();
  }
};

// document ready
$(function documentReady() {
  var data = {};
  
  $.when(
    $.getJSON( 'json/targets.json', function(targetData) {
      data.targets = targetData;
    } ),
    
    $.getJSON( 'json/eventTargets.json', function(eventTargetData) {
      data.eventTargets = eventTargetData;
    } )
  ).then( function() {
    var map = Object.create( Map );
    var filter = Object.create( Filter );
    
    map.init( [30.9327, 62.6716], INIT_ZOOM, 'map-div' );
    filter.init( $( '#filter' ), map );

    var listObject = new List();
    map.connectList( listObject );
    map.connectPreviewArea( $( '#preview' ) );
    
    var mapIndex = 1;
    
    for ( var i = 0; i < data.targets.length; i++ ) {
      var targetObject = data.targets[i];
      targetObject.index = mapIndex;
      listObject.addTarget( new Target( targetObject ) );
      
      if ( ! targetObject.sub ) {
        map.addTarget( targetObject, IN_ZOOM[targetObject.map] );
        mapIndex++;
      }
      
      if ( i >= 9 ) break;
    }
    /* TEMPORARILY DISABLED
    data.eventTargets.forEach( function eachEventTarget(eventTargetObject, index) {
      eventTargetObject.index = index;
      var now = new Date();
      var eventStarts = new Date( eventTargetObject.starts );
      var eventExpires = new Date( eventTargetObject.expires );

      if ( eventStarts <= now && now < eventExpires ) {
        map.addEventTarget( eventTargetObject, IN_ZOOM[eventTargetObject.map] );
        listObject.addEventTarget( new Target( eventTargetObject ) );
      }
    } );
    */
    listObject.listHtml();
    
    mapEvents( listObject );
  } );
}); // $(document).ready


function List() {
  this.targets = [];
  this.eTargs = [];

  this.addTarget = function(targ) {
    if (!targ.sub) {
      this.targets.push([targ]);
    } else {
      var n = this.targets.length;
      this.targets[n - 1].push(targ);
    }
  };
  
  this.addEventTarget = function(eTarg) {
    this.eTargs.push( eTarg );
  }
  
  this.listHtml = function() {
    var targs = this.targets;
    var eTargs = this.eTargs;
    var html = '';
    
    eTargs.forEach( function eachETarg(eTarg) {
      var i = eTarg.index;
      html += '<div class="target" id="event-target-' + i + '" data-event-target="' + i + '"><div class="list-index-container"></div><!-- .list-index-container -->';
      html += eTarg.targetHtml();
      html += '</div><!-- .target -->';
    } );
    
    $.each(targs, function(key, val) {
      var i = key + 1;
      html += '<div class="target" id="target-' + i + '" data-target="' + i + '"><div class="list-index-container"><div class="index"><i class="' + val[0].faClass + '"></i></div></div><!-- .list-index-container -->';
      $.each(val, function(key2, val2) {
        html += val2.targetHtml();
      });
      html += '</div><!-- .target -->';

    });
    
    $("#list").html(html);
  };
  
  this.scrollTo = function(i, isEvent) {
    var idPrefix = ( isEvent ) ? '#event-target-' : '#target-';
    var offsetZero = $('.target:first-child').offset().top;
    var targetId = idPrefix + i;
    var offsetTop = $(targetId).offset().top - offsetZero;
    $('.list-container').animate({
      scrollTop: offsetTop
    }, ANIMATION_SPEED);
  };
}

function Target(targetObject) {
  this.map = targetObject.map;
  this.name = targetObject.listName || targetObject.name;
  this.phone = targetObject.phone;
  this.url = targetObject.url;
  this.address = targetObject.address;
  this.info = targetObject.info;
  this.url = targetObject.url;
  this.fb = targetObject.fb;
  this.sub = targetObject.sub;
  this.mapPercent = targetObject.mapPercent;
  this.index = targetObject.index || null;
  this.faClass = FA[targetObject.branch] || null;
  var t = this;

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
    var urlObject = filterUrl( this.url );
    var html = '<div class="list-text-container' + subClass + '"><h3 class="name">' + this.name + '</h3><p><span class="phone">' + this.phone + '</span>';

    html += this.itemHtml(this.address, 'span', {
      class: 'address'
    });
    /* TO BE REMOVED
    html += this.itemHtml(this.info, 'span', {
      class: 'info'
    });
    */
    if ( urlObject ) {
      html += this.itemHtml(urlObject.view, 'a', {
        class: 'url',
        href: urlObject.href,
        target: '_blank'
      });
    }

    html += this.itemHtml(this.fb, 'a', {
      href: this.fb,
      class: 'facebook',
      target: '_blank',
      customValue: '<img src="images/fb-logo.png" class="fb-logo" width="15" height="15" alt="Facebook Logo">'
    });

    html += '</p></div><!-- .list-text-container -->';

    return html;
  };
  
  this.additionalContent = function() {
    var $additionalContent = $( '<div>' )
      .addClass( 'target__additional-content js-additional-content' );
    
    var $targetImage = $( '<img>' )
      .addClass( 'target__image' )
      .attr( {
        src: 'http://via.placeholder.com/1280x720?text=Kuva',
        alt: 'Kuva kohteesta ' + t.name,
        width: '1280',
        height: '720'
      } )
      .appendTo( $additionalContent );
    
    var $targetInfo = $( '<div>' )
      .addClass( 'target__info' )
      .text( t.info )
      .appendTo( $additionalContent );
    
    var $targetDescription = $( '<div>' )
      .addClass( 'target__description' )
      .html( "<p>Tähän tulee lyhyt kuvaus yrityksestä</p><p>Mieleni minun tekevi, aivoni ajattelevi lähteäni laulamahan, saa'ani sanelemahan, sukuvirttä suoltamahan, lajivirttä laulamahan. Sanat suussani sulavat, puhe'et putoelevat, kielelleni kerkiävät, hampahilleni hajoovat.</p><p>Veli kulta, veikkoseni, kaunis kasvinkumppalini! Lähe nyt kanssa laulamahan, saa kera sanelemahan yhtehen yhyttyämme, kahta'alta käytyämme! Harvoin yhtehen yhymme, saamme toinen toisihimme näillä raukoilla rajoilla, poloisilla Pohjan mailla.</p>")
      .appendTo( $additionalContent );
    
    return $additionalContent;
  };
}

function filterUrl(input) {
  if ( ! input ) return null;
  var re = /^(http(?:s)?:\/\/)?([^\/(?!$)]*)(\/?)$/;
  var urlParts = input.match( re );
  
  var protocol = urlParts[1] || 'http://';
  
  return {
    href: protocol + urlParts[2] + urlParts[3],
    view: urlParts[2]
  };
}

function mapEvents(listObject, mapWindow) {
  $('#list').on('click', '.target', function() {
    var mapTargetSelector = ( $( this ).attr( 'data-target' ) ) ? '#map-target-' + $( this ).attr( 'data-target' ) : '#map-event-target-' + $( this ).attr( 'data-event-target' );
    $( mapTargetSelector ).trigger( 'click', [ true ] );
  });

  $( '#list' ).on( 'mouseover', '.target', function listTargetMouseover() {
    var mapTargetSelector = '#map-target-' + $( this ).attr( 'data-target' );
    $( mapTargetSelector ).addClass( 'hover' );
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
  
  $('#map-div').on('mouseover', '.event-display', function() {
    var targetId = '#event-target-' + $( this ).attr( 'data-event-target' );
    $( targetId ).addClass( 'hover' );
  }); // #map-div on mouseover

  $('#map-div').on('mouseout', '.event-display', function() {
    var targetId = '#event-target-' + $( this ).attr( 'data-event-target' );
    $( targetId ).removeClass( 'hover' );
  }); // #map-div on mouseout
}
