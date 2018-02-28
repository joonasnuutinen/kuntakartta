const ANIMATION_SPEED = 400;
const IN_ZOOM = {
  keskusta: 16,
  kunta: 11
 };
const INIT_ZOOM = 14;
const INIT_CENTER = [30.9327, 62.6716];
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
    
    $( '#toggle-filter' )
      .click( function filterButtonClicked() {
        $( '#filter' ).slideToggle();
      } );
    
    t.target = $target;
    t.map = map;
    t.options = [];
  },
  
  toggleOptions: function() {
    this.optionList.slideToggle();
  },
  
  addOption: function( optionName ) {
    if ( this.options.includes( optionName ) ) return;
    
    this.options.push( optionName );
  },
  
  createOptionElement: function( optionName, showAll ) {
    var faClass = FA[optionName] || '';
    
    var $icon = $( '<span>' )
      .addClass( 'filter__icon' )
      .html( '<i class="' + faClass + '"></i>' );
    
    var $option = $( '<li>' )
      .addClass( 'filter__option' )
      .text( optionName )
      .prepend( $icon )
      .click( $.proxy( function optionClicked() {
        $( '.filter__option' ).removeClass( 'filter__option--selected' );
        $( '#toggle-filter' ).removeClass( 'toggle-filter--filtered' );
        $( '#filter' ).hide();
        if ( showAll ) {
          this.map.showAllTargets();
        } else {
          var pos = ol.proj.fromLonLat( INIT_CENTER );
          this.map.showTargetsByBranch( optionName );
          this.map.map.getView().animate( { zoom: INIT_ZOOM, center: pos, duration: ANIMATION_SPEED } );
          this.map.preview.hide();
          this.map.resetActiveTargets();
          $option.addClass( 'filter__option--selected' );
          $( '#toggle-filter' ).addClass( 'toggle-filter--filtered' );
        }
      }, this ) );
    
    if ( showAll ) {
      $option.addClass( 'filter__option--show-all' );
    }
    
    return $option;
  },
  
  addOptionsToList: function() {
    this.createOptionElement( 'Näytä kaikki', true ).appendTo( this.optionList );
    this.options.sort().forEach( $.proxy( function eachOption( optionName ) {
      this.createOptionElement( optionName ).appendTo( this.optionList );
    }, this ) );
  }
};

var Preview = {
  init: function( $target ) {
    this.target = $target;
    this.previewHeight = 0;
  },
  
  create: function( $listTarget, $additionalContent ) {
    var $preview = this.target;
    var expandPreview = this.expand.bind( this );
    var showPreview = this.show.bind( this );
    var t = this;
    
    var $expandButton = $( '<span>' )
      .addClass( 'expand-preview' )
      .html( '<i class="fas fa-chevron-up"></i>' )
      .click( function expandButtonClicked() {
        if ( $preview.hasClass( 'preview--expanded' ) ) {
          // Minimize preview
          showPreview();
        } else {
          // Expand preview
          expandPreview();
        }
      } );
    
    var $previewTarget = $listTarget
      .clone()
      .attr( 'id', 'preview-target' )
      .removeClass( 'active hover' )
      .append( $expandButton );
    
    $preview
      .html( $previewTarget )
      .append( $additionalContent )
    
    this.previewHeight = $previewTarget.innerHeight();
  },
  
  show: function() {
    var $preview = this.target;
    var previewHeight = this.previewHeight;
    
    if ( previewHeight === 0 ) return;
    
    $preview
      .removeClass( 'preview--expanded' )
      .addClass( 'preview--resizing' )
      .animate( {
        height: previewHeight
      }, ANIMATION_SPEED, function previewResized() {
        $( this )
          .addClass( 'preview--small' )
          .removeClass( 'preview--resizing' );
      } );
  },
  
  expand: function() {
    var $preview = this.target;
    var $additionalContent = $preview.find( '.js-additional-content' ).hide( 0 );
    
    var expandedHeight = $preview.outerHeight() + $additionalContent.outerHeight() + 1;
    
    $additionalContent.show( 0 );

    $preview
      .addClass( 'preview--resizing preview--expanding' )
      .removeClass( 'preview--small' )
      .animate( {
        height: expandedHeight
      }, ANIMATION_SPEED, function previewExpanded() {
        $( this ).addClass( 'preview--expanded' );
        $( this ).removeClass( 'preview--resizing preview--expanding' );
      } )
     
  },
  
  hide: function(remove) {
    var $preview = this.target;
    var t = this;
    
    if ( t.previewHeight === 0 ) return;
    
    $preview
      .addClass( 'preview--resizing' )
      .removeClass( 'preview--expanded preview--small' )
      .animate( {
        height: ''
      }, ANIMATION_SPEED, function previewHidden() {
        $( this ).removeClass( 'preview--resizing' );
        
        if ( remove ) {
          t.previewHeight = 0;
        }
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
      t.preview.hide( true );
      t.resetActiveTargets();
      $( '#filter' ).hide( 0 );
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
        'data-target': index,
        'data-branch': targetObject.branch
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
        
        t.preview.create( $listTarget, $additionalContent );
        t.preview.show();
        
        t.listObject.hideList();
        $( '#filter' ).hide( 0 );
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
  
  connectPreviewArea: function( preview ) {
    this.preview = preview;
  },
  
  resetActiveTargets: function() {
    $( '.index, .target, .event-display' ).removeClass( 'active' );
  },
  
  hideAllTargets: function() {
    this.target.find( '.index' ).hide();
  },
  
  showAllTargets: function() {
    this.target.find( '.index' ).show();
  },
  
  showTargetsByBranch: function(branch) {
    this.target.find( '.index' ).each( function eachIndex() {
      if ( $( this ).attr( 'data-branch' ) == branch ) {
        $( this ).show();
      } else {
        $( this ).hide();
      }
    } );
  }
};

var List = {
  init: function() {
    var t = this;
    
    this.targets = [];
    this.eTargs = [];
    
    
    $( '#toggle-list' )
      .click( function showListContainerClicked(e) {
        var $this = $( this );
        
        if ( $this.hasClass( 'toggle-list--toggled' ) ) {
          // Hide list
          t.hideList();
        } else {
          // Show list
          t.showList();
        }
        
        //t.preview.hide();
      } );
  },

  addTarget: function(targ) {
    if ( !targ.sub ) {
      this.targets.push( [targ] );
    } else {
      var n = this.targets.length;
      this.targets[n - 1].push( targ );
    }
  },
  
  addEventTarget: function(eTarg) {
    this.eTargs.push( eTarg );
  },
  
  listHtml: function() {
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
      html += '<div class="target" id="target-' + i + '" data-target="' + i + '" data-branch="' + val.branch + '"><div class="list-index-container"><div class="index"><i class="' + val[0].faClass + '"></i></div></div><!-- .list-index-container -->';
      $.each(val, function(key2, val2) {
        html += val2.targetHtml();
      });
      html += '</div><!-- .target -->';

    });
    
    $("#list").html(html);
  },
  
  setShowListStatus: function( action, text ) {
    $( '#toggle-list' )
      .text( text )
      .attr( 'data-action', action );
  },
  
  scrollTo: function(i, isEvent) {
    var idPrefix = ( isEvent ) ? '#event-target-' : '#target-';
    var offsetZero = $( '#list .target:first-child' ).offset().top;
    var targetId = idPrefix + i;
    var offsetTop = $( targetId ).offset().top - offsetZero;
    
    $( '#list' ).animate( {
      scrollTop: offsetTop
    }, ANIMATION_SPEED );
  },
  
  showList: function() {
    var $listContainer = $( '#list-container' );
    var listContainerWidth = $listContainer.innerWidth();
    
    $listContainer
      .css( {
        right: - listContainerWidth,
        visibility: 'visible'
      } )
      .animate( {
        right: 0
      }, ANIMATION_SPEED );
    
    // Change button state and icon
    $( '#toggle-list' )
      .addClass( 'toggle-list--toggled' )
      .html( '<i class="fas fa-times"></i>' );
    
    // Hide preview
    this.preview.hide();
  },
  
  hideList: function() {
    var $listContainer = $( '#list-container' );
    var listContainerWidth = $listContainer.innerWidth();
    
    $listContainer
      .animate( {
        right: - listContainerWidth
      }, ANIMATION_SPEED, function animationDone() {
        $( this ).css( {
          right: '',
          visibility: ''
        } );
      } );
    
    // Change button state and icon
    $( '#toggle-list' )
      .removeClass( 'toggle-list--toggled' )
      .html( '<i class="fas fa-bars"></i>' );
    
    // Show preview
    this.preview.show();
  },
  
  connectPreviewArea: function( preview ) {
    this.preview = preview;
  }
}

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
    var listObject = Object.create( List );
    var preview = Object.create( Preview );
    
    map.init( INIT_CENTER, INIT_ZOOM, 'map-div' );
    filter.init( $( '#filter' ), map );
    listObject.init();
    preview.init( $( '#preview' ) );
    
    map.connectList( listObject );
    map.connectPreviewArea( preview );
    listObject.connectPreviewArea( preview );
    
    var mapIndex = 1;
    
    for ( var i = 0; i < data.targets.length; i++ ) {
      var targetObject = data.targets[i];
      targetObject.index = mapIndex;
      listObject.addTarget( new Target( targetObject ) );
      filter.addOption( targetObject.branch );
      
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
    filter.addOptionsToList();
    mapEvents( listObject );
  } );
}); // $(document).ready

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
  this.branch = targetObject.branch;
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
  
  $('#list').on('click', 'a', function linkClicked(e) {
    e.stopPropagation();
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
