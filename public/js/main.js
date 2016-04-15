(function(){

  var gemfileUpload = document.getElementById("gemfile-upload");
  var gemfileTextarea = document.getElementById("gemfile-textarea");
  var gemfileName = document.querySelectorAll(".gemfile-name")[0];

  gemfileUpload.addEventListener("change", function(){
    var fullPath = gemfileUpload.value;
    if (fullPath.length) {
      addClass(gemfileTextarea, "hidden");
      if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
          filename = filename.substring(1);
        }
        gemfileName.innerHTML = filename;
      }
    } else {
      removeClass(gemfileTextarea, "hidden")
      gemfileName.innerHTML = null;
    }
  });

  // http://youmightnotneedjquery.com/
  function addClass(el, className){
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  }

  function removeClass(el, className){
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

}());
