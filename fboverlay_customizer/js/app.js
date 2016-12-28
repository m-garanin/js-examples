//(function() {
  
  function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }
  
  // создание хоста
  var stage = new Konva.Stage({
    container: 'canvas',
    width: 1280,
    height: 720
  });
  
  // хранение текущего фонового изображения
  // нужно для удаления старого при выборе нового изображения
  var currentBackground = null;
  
  // создаем элементы для текста
  var layerTexts = new Konva.Layer();
  
  var texts_names = [
    'ANGRY',
    'HAHA',
    'LIKE',
    'LOVE',
    'SAD',
    'WOW'
  ];
  
  var texts = {};
  
  for(var i = 0; i < texts_names.length; i++) {
    
    var elem = texts_names[i];
    
    texts[elem] = new Konva.Text({
      x: 0,
      y: 0,
      text: '999',
      fill: '#000',
      fontSize: 35,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      visible: false,
      draggable: true
    });
    
    texts[elem].elem = elem;
    
    texts[elem].on('click', function(e) {
      
      var tooltip = document.querySelector('.tooltip-type');
      
      tooltip.style.display = 'block';
      tooltip.style.left = (e.evt.clientX + 10) + 'px';
      tooltip.style.top = (e.evt.clientY + 10) + 'px';
      
      tooltip.textContent = e.target.elem;
      
    });
    
    texts[elem].on('mouseout', function(e) {
      
      var tooltip = document.querySelector('.tooltip-type');
      
      tooltip.style.display = 'none';
      
    });
    
    layerTexts.add(texts[elem]);
    
    document.querySelector('.' + elem).addEventListener('change', function() {
      
      var elem = this.className;
      
      var is_visible = this.checked;
      
      texts[elem].visible(is_visible);
      
      stage.draw();
      
    });
    
  }
  
  stage.add(layerTexts);
  layerTexts.setZIndex(99);
  
  document.querySelector('#canvas').addEventListener('mousedown', function(e) {
    
    var tooltip = document.querySelector('.tooltip-type');
    
    tooltip.style.display = 'none';
    
  });
  
  document.querySelector('.font-size').addEventListener('input', function() {
    
    var size = this.value;
    
    for(var text in texts) {
      
      var elem = texts[text];
      
      elem.fontSize(size);
      
    }
    
    stage.draw();
    
  });
  
  document.querySelector('.font-bold').addEventListener('change', function() {
    
    var style = this.checked ? 'bold' : 'normal';
    
    for(var text in texts) {
      
      var elem = texts[text];
      
      elem.fontStyle(style);
      
    }
    
    stage.draw();
    
  });
  
  // сортировка слоев
  var sortable = new Sortable(document.querySelector('.layers-list'), {
    animation: 150,
    onSort: function(e) {
      
      updateZIndexes();
      
    }
  });
  
  // ресайз изображенийfunction update(activeAnchor) {
  function update(activeAnchor) {
      var group = activeAnchor.getParent();

      var topLeft = group.get('.topLeft')[0];
      var topRight = group.get('.topRight')[0];
      var bottomRight = group.get('.bottomRight')[0];
      var bottomLeft = group.get('.bottomLeft')[0];
      var image = group.get('Image')[0];

      var anchorX = activeAnchor.getX();
      var anchorY = activeAnchor.getY();

      // update anchor positions
      switch (activeAnchor.getName()) {
          case 'topLeft':
              topRight.setY(anchorY);
              bottomLeft.setX(anchorX);
              break;
          case 'topRight':
              topLeft.setY(anchorY);
              bottomRight.setX(anchorX);
              break;
          case 'bottomRight':
              bottomLeft.setY(anchorY);
              topRight.setX(anchorX);
              break;
          case 'bottomLeft':
              bottomRight.setY(anchorY);
              topLeft.setX(anchorX);
              break;
      }

      image.position(topLeft.position());

      var width = topRight.getX() - topLeft.getX();
      var height = bottomLeft.getY() - topLeft.getY();
      if(width && height) {
          image.width(width);
          image.height(height);
      }
  }
  
  function addAnchor(group, x, y, name) {
      
      var layer = group.getLayer();

      var anchor = new Konva.Circle({
          x: x,
          y: y,
          stroke: '#666',
          fill: '#ddd',
          strokeWidth: 2,
          radius: 8,
          name: name,
          draggable: true,
          dragOnTop: false,
          visible: false
      });
      
      layer.on('mouseover', function() {
        anchor.show();
        layer.draw();
      });
      
      layer.on('mouseout', function() {
        anchor.hide();
        layer.draw();
      });
      
      anchor.on('dragmove', function() {
          update(this);
          layer.draw();
      });
      anchor.on('mousedown touchstart', function() {
          group.setDraggable(false);
          this.moveToTop();
      });
      anchor.on('dragend', function() {
          group.setDraggable(true);
          layer.draw();
      });
      // add hover styling
      anchor.on('mouseover', function() {
          var layer = this.getLayer();
          document.body.style.cursor = 'pointer';
          this.setStrokeWidth(4);
          layer.draw();
      });
      anchor.on('mouseout', function() {
          var layer = this.getLayer();
          document.body.style.cursor = 'default';
          this.setStrokeWidth(2);
          layer.draw();
      });

      group.add(anchor);
      
  }
  
  var removeImage = function() {
    
    var id = this.parentNode.getAttribute('data-id');
    
    this.parentNode.parentNode.removeChild(this.parentNode);
    
    imageLayers[id].remove();
    delete(imageLayers[id]);
    
    updateZIndexes();
    
  };
  
  var updateZIndexes = function() {
    
    var layers = document.querySelectorAll('.layer');
    
    for(var i = 0; i < layers.length; i++) {
      
      var id = layers[i].getAttribute('data-id');
      
      imageLayers[id].setZIndex(layers.length - i);
      
    }
    
    layerTexts.setZIndex(999);
    
  };
  
  var imageLayers = {};
  
  // при выборе изображения, получаем base64 представление и добавляем изображение на холст
  document.querySelector('#input-image').addEventListener('change', function() {
    
    var file = this.files[0];
    
    var img = new Image;
    
    img.onload = function() {
      
      var id = createUUID();
      
      var layerImage = new Konva.Layer();
      
      var cImg = new Konva.Image({
        x: 0,
        y: 0,
        image: img
      });
      
      var group = new Konva.Group({
        x: 0,
        y: 0,
        draggable: true
      });
      layerImage.add(group);
      group.add(cImg);
      addAnchor(group, 0, 0, 'topLeft');
      addAnchor(group, img.width, 0, 'topRight');
      addAnchor(group, img.width, img.height, 'bottomRight');
      addAnchor(group, 0, img.height, 'bottomLeft');
      
      
      
      stage.add(layerImage);
      
      imageLayers[id] = layerImage;
      
      var layerElem = document.createElement('div');
      layerElem.setAttribute('data-id', id);
      layerElem.className = 'layer';
      layerElem.innerHTML = '<span class="glyphicon glyphicon-remove layer-delete"></span><div class="layer-prev-wrap"><img src="test.jpg" class="layer-prev"></div>';
      
      layerElem.querySelector('.layer-delete').onclick = removeImage;
      layerElem.querySelector('.layer-prev').src = URL.createObjectURL(file);
      
      var layersBlock = document.querySelector('.layers-list');
      
      layersBlock.insertBefore(layerElem, layersBlock.firstChild);
      
      updateZIndexes();
      
    }
    
    img.src = URL.createObjectURL(file);
    
  });
  
  // создание архива и загрузка пользователю
  document.querySelector('#download').addEventListener('click', function() {
    
    var name = document.querySelector('#archive_name').value;
    
    if(!name) return alert('Enter name of theme');
    
    // создаем объект для сохранения свойст текстовых элементов
    var textProps = {};
    
    var bold = document.querySelector('.font-bold').checked;
    var size = document.querySelector('.font-size').value;
    
    for(var text in texts) {
      
      if(!document.querySelector('.' + text).checked) continue;
      
      var textBlock = {
        "color": "#000",
        "font-family": "Arial",
        "font-size": parseInt(size),
        "italic": false,
        "bold": bold
      };
      
      textBlock.x = texts[text].x();
      textBlock.y = texts[text].y();
      
      textProps[text] = textBlock;
      
    }
    
    // получаем изображение с канваса
    for(var text in texts) texts[text].hide();
    
    stage.draw();
    
    var imageData = stage.toDataURL({pixelRatio:1});
    
    // создаем zip архива
    var zip = new JSZip();
    zip.file('settings.json', JSON.stringify(textProps));
    zip.file('background.png', imageData.substr(imageData.indexOf(',') + 1), {base64: true});
    zip.generateAsync({type: 'blob'}).then(function(content) {
      
      saveAs(content, name + '.zip');
      
      for(var text in texts) if(document.querySelector('.' + text).checked) texts[text].show();
      
      stage.draw();
      
    });
    
  });
  
//})();
