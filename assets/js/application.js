(function(){

  if (window.jobID){
    getStatus(window.jobID);
  }

  var gemfileUpload = document.getElementById("gemfile-upload");
  var gemfileTextarea = document.getElementById("gemfile-textarea");
  var gemfileName = document.querySelectorAll(".gemfile-name")[0];
  var submitBtn = document.querySelectorAll(".submit-btn")[0];

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
    updateSubmitBtn();
  });

  gemfileTextarea.addEventListener("input", function(){
    updateSubmitBtn();
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

  function getStatus(jobID){
    var request = new XMLHttpRequest();
    request.open("GET", "/result/" + window.jobID, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var status = JSON.parse(request.responseText);
        if (status.status === "completed"){
          document.querySelectorAll(".grub-gemfile")[0].innerHTML = status.output_html;
          var progressDiv = document.querySelectorAll(".progress")[0]
          progressDiv.parentNode.removeChild(progressDiv);
          var code = document.querySelectorAll(".CodeRay")[0];
          code.addEventListener("dblclick", function(){
            SelectText(code);
          });
        } else {
          var percentage = status.percentage + "%";
          var progressBar = document.querySelectorAll(".progress-bar")[0];
          progressBar.style.width = percentage;
          progressBar.innerHTML = percentage;
          setTimeout(getStatus.bind(null, jobID), 1000);
        }

      } else {
        alert("There was an error getting the job results");
      }
    };

    request.onerror = function() {
      alert("There was an error getting the job results");
    };

    request.send();
  }

  function updateSubmitBtn() {
    if (gemfileUpload.value.length || gemfileTextarea.value.length) {
      removeClass(submitBtn, "disabled");
    } else {
      addClass(submitBtn, "disabled");
    }
  }

  // http://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse/987376#987376
  function SelectText(element) {
      var doc = document
          , range, selection;
      if (doc.body.createTextRange) {
          range = document.body.createTextRange();
          range.moveToElementText(element);
          range.select();
      } else if (window.getSelection) {
          selection = window.getSelection();
          range = document.createRange();
          range.selectNodeContents(element);
          selection.removeAllRanges();
          selection.addRange(range);
      }
  }



}());
