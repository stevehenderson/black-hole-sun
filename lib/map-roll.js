var WorldMap = (function () {
    
  var map;
  
  //argh;
  // Group states into Areas
  var areas = [];
  areas[0] = [];
  //LATEM
  areas[1] = ["mx", "ar", "bo", "br", "cl", "co","ec","fk","gf","gy","gy","py","pe","sr","uy","ve","gt","pa","cu","ai","ag","aw","bs","bb","bz","bm","bq","vg","ky","cr","cu","cw","dm","do","sv","gd","gp","gt","ht","hn","jm","mq","pm","ms","cw","kn","ni","pa","bq","bq","sx","kn","lc","pm","vc","tt","tc",];  
  //EUR-ME-AF
  areas[2] = ["az","am","ge","kw","om","ae","sy","ye","qa","sa","jo","lb","il","tr","ir","iq","ru", "gl", "al","at","by","be","ba","bg","hr","cy","cz","dk","ee","fo","fi","fr","de","gi","gr","hu","is","ie","im","it","rs","lv","li","lt","lu","mk","mt","md","mc","me","nl","no","pl","pt","ro","sm","rs","sk","si","es","se","ch","ua","gb","va","rs",
              "dz","ao","sh","bj","bw","bf","bi","cm","cv","cf","td","km","cg","cd","dj","eg","gq","er","et","ga","gm","gh","gn","gw","ci","ke","ls","lr","ly","mg","mw","ml","mr","mu","yt","ma","mz","na","ne","ng","st","re","rw","st","sn","sc","sl","so","za","ss","sh","sd","sz","tz","tg","tn","ug","cd","zm","tz","zw"]  
  //Asia
  areas[3] = ["vu","tl", "pg","au", "pf", "af","bh","bd","bt","bn","kh","cn","cx","cc","io","hk","in","id","jp","kz","kg","la","mo","my","mv","mn","mm","np","kp","pk","ps","ph","sg","kr","lk","tw","tj","th","tm","uz","vn"];
  //NAM
  areas[4] = ["us", "ca"];

  function selectArea(code){
    
    areas.forEach(function(area) {

      if(area.indexOf(code)>-1) {
        map.setSelectedRegions(area);
        return;
      }
    });
  }

  function clearAll(){    
    map.clearSelectedRegions();
  }
  
  var initializeMap = function () {
    
    //Declare the map
    map = new jvm.Map({
      container: $('#vmap'),
      map: 'world_en' ,
      backgroundColor: null,
      color: '#2b484e',
      hoverOpacity: 0.7,
      borderWidth: 1,
      borderColor: '#36bcb1',
      selectedColor: '#338583',
      enableZoom: false,
      showTooltip: false,                
      scaleColors: ['#C8EEFF', '#006491'],
      normalizeFunction: 'polynomial',
      //zoomOnScroll: true,
      regionsSelectable: true,
      regionStyle: {
        initial: {
          fill: "#2b484e"
        },
        selected: {
          fill: "#338583"
        }
      },
      onRegionClick: function(e, code){
        clearAll();
        console.log("selected map code " + code);
        selectArea(code);
        return false;
      }
    });
  
    // Collect the rest of the World  
    var states = areas.join(",");
    for(var code in map.regions) {
      if(map.regions.hasOwnProperty(code)) {
        if(states.indexOf(code) == -1) {
          areas[0].push(code);
        }
      }
    }

  }

  //selectArea("us");

    //Exposed methods
    return {
      initializeMap: initializeMap
    }  
  })();
  
