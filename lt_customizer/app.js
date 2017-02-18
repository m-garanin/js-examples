//(function() {
  
  // создание хоста
  var stage = new Konva.Stage({
    container: 'canvas',
    width: 1280,
    height: 200
  });

  // хранение текущего фонового изображения
  // нужно для удаления старого при выборе нового изображения
  var currentBackground = null;
  
  // создаем элементы для текста
  var layerTexts = new Konva.Layer();
  
  var texts = {};
  texts['1'] = new Konva.Text({
    x: 0,
    y: 0,
      text: '',
      fill: 'green',
    draggable: true
  });
  
  layerTexts.add(texts['1']);
  texts['1'].setZIndex(5);
  texts['2'] = new Konva.Text({
    x: 0,
    y: 50,
      text: '',
    draggable: true
  });
  
  layerTexts.add(texts['2']);
  texts['2'].setZIndex(4);
  
  stage.add(layerTexts);
  
  // функция применяет изменения свойст текста
  var applyTextProps = function(textNum) {
    
    var text = texts[textNum];
    
    var bold = document.querySelector('.font-bold[data-text="' + textNum + '"]').checked ? 'bold' : false;
    var italic = document.querySelector('.font-italic[data-text="' + textNum + '"]').checked ? 'italic' : false;
    var style = '';
    if(bold) {
      style += bold;
      if(italic) style += ' ' + italic;
    }
    if(italic && !bold) style += italic;
    if(!italic && !bold) style = 'normal';
    
    text.text(document.querySelector('.text[data-text="' + textNum + '"]').value);
    text.fontFamily(document.querySelector('.select-font[data-text="' + textNum + '"]').value);
    text.fontSize(document.querySelector('.font-size[data-text="' + textNum + '"]').value);
    text.fill(document.querySelector('.font-color[data-text="' + textNum + '"]').value);
    text.fontStyle(style);
    text.setZIndex(5);
    
    if(textNum == 1) texts['2'].setZIndex(4);
    else texts['1'].setZIndex(4);
    
    layerTexts.setZIndex(2);
    
    stage.draw();


    console.log(text.getClientRect());
  };
  
  // функция получения свойств текстового элемента
  var getTextProps = function(textNum) {
    
    var text = texts[textNum];
    
    var props = {};
    
    props.x = text.x();
    props.y = text.y();
    props.color = text.fill();
    props['font-family'] = text.fontFamily();
    props['font-size'] = parseInt(text.fontSize());
    props.bold = document.querySelector('.font-bold[data-text="' + textNum + '"]').checked;
    props.italic = document.querySelector('.font-italic[data-text="' + textNum + '"]').checked;
    
    return props;
    
  };
  
  var text1PropsInputs = document.querySelectorAll('[data-text="1"]');
  for(var i = 0; i < text1PropsInputs.length; i++) {
    text1PropsInputs[i].addEventListener('input', applyTextProps.bind(null, 1));
    text1PropsInputs[i].addEventListener('change', applyTextProps.bind(null, 1));
  }
  var text2PropsInputs = document.querySelectorAll('[data-text="2"]');
  for(var i = 0; i < text2PropsInputs.length; i++) {
    text2PropsInputs[i].addEventListener('input', applyTextProps.bind(null, 2));
    text2PropsInputs[i].addEventListener('change', applyTextProps.bind(null, 2));
  }
  
  // при выборе изображения, получаем base64 представление и добавляем изображение на холст
  document.querySelector('#input-image').addEventListener('change', function() {
    
    var img = new Image;
    
    img.onload = function() {
      
      if(currentBackground) currentBackground.remove();
      
      var layerImage = new Konva.Layer();
      
      var cImg = new Konva.Image({
        x: 0,
        y: 0,
        image: img,
        draggable: true
        /*width: 106,
        height: 118*/
      });
      
      layerImage.add(cImg);
      
      stage.add(layerImage);
      
      layerImage.setZIndex(0);
      
      currentBackground = layerImage;
      
    }
    
    img.src = URL.createObjectURL(this.files[0]);
    
  });
  
  // создание архива и загрузка пользователю
  document.querySelector('#download').addEventListener('click', function() {
    
    var name = document.querySelector('#archive_name').value;
    
    if(!name) return alert('Enter name of theme');
    
    // создаем объект для сохранения свойст текстовых элементов
    var textProps = {};
    textProps.first = getTextProps(1);
    textProps.second = getTextProps(2);
    
      
    // получаем изображение с канваса
    texts['1'].hide();
    texts['2'].hide();
    
    stage.draw();
    
    var imageData = stage.toDataURL({pixelRatio:1});
    
    // создаем zip архива
    var zip = new JSZip();
    zip.file('settings.json', JSON.stringify(textProps));
    zip.file('background.png', imageData.substr(imageData.indexOf(',') + 1), {base64: true});
    zip.generateAsync({type: 'blob'}).then(function(content) {
      
      saveAs(content, name + '.zip');
      
      texts['1'].show();
      texts['2'].show();
      
      stage.draw();
      
    });
    
  });

document.querySelector('#download2').addEventListener('click', function() {
  var name = document.querySelector('#archive_name').value;
  if(!name) return alert('Enter name of theme');

  var imageData = stage.toDataURL({pixelRatio:1});
  
  // создаем json файл
  var data = {
    scene: imageData
  };
  var json = JSON.stringify(data);
  var blob = new Blob([json], {type: "application/json"});
  var url  = URL.createObjectURL(blob);

  var link = document.createElement('a');
  link.download = "lt_" + name + ".json";
  link.href = url;
  link.click();
});

function init(){
    applyTextProps(1);
    applyTextProps(2);
}

init();
//})();
