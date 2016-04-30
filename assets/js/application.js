(function(){

  if (window.jobID){
    getStatus(window.jobID);
  }

  var gemfileText = document.getElementById("gemfile-text");
  var gemfileUpload = document.getElementById("gemfile-upload");
  var gemfileUploadBtn = document.querySelectorAll(".gemfile-form__upload")[0];
  var gemfileTextarea = document.getElementById("gemfile-textarea");
  var gemfileName = document.querySelectorAll(".gemfile-name")[0];
  var submitBtn = document.querySelectorAll(".submit-btn")[0];

  gemfileUpload.addEventListener("change", function(){
    var fullPath = gemfileUpload.value;
    if (fullPath.length) {
      addClass(gemfileTextarea, "hidden");
      addClass(gemfileText, "hidden");
      displayOrDividers(false);
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
      removeClass(gemfileText, "hidden");
      displayOrDividers(true);
      gemfileName.innerHTML = null;
    }
    updateSubmitBtn();
  });

  gemfileTextarea.addEventListener("input", function(){
    if (gemfileTextarea.value.length) {
      addClass(gemfileUploadBtn, "hidden");
      addClass(gemfileText, "hidden");
      displayOrDividers(false);
    } else {
      removeClass(gemfileUploadBtn, "hidden");
      removeClass(gemfileText, "hidden");
      displayOrDividers(true);
    }
    updateSubmitBtn();
  });

  gemfileText.addEventListener("input", function(){
    if (gemfileText.value.length) {
      addClass(gemfileUploadBtn, "hidden");
      addClass(gemfileTextarea, "hidden");
      displayOrDividers(false);
    } else {
      removeClass(gemfileUploadBtn, "hidden");
      removeClass(gemfileTextarea, "hidden");
      displayOrDividers(true);
    }
    updateSubmitBtn();
  });

  function displayOrDividers(bool){
    if (bool) {
      Array.prototype.forEach.call(document.querySelectorAll(".or-divider"), function(el){
        removeClass(el, "hidden");
      });
    } else {
      Array.prototype.forEach.call(document.querySelectorAll(".or-divider"), function(el){
        addClass(el, "hidden");
      });
    }

  }

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
        if (status.status === "completed") {
          document.querySelectorAll(".annotate_gem-gemfile")[0].innerHTML = status.output_html;
          var progressDiv = document.querySelectorAll(".progress")[0]
          progressDiv.parentNode.removeChild(progressDiv);
          var code = document.querySelectorAll(".CodeRay")[0];
          code.addEventListener("dblclick", function(){
            SelectText(code);
          });
        } else if (status.status === "failed") {
          var progressDiv = document.querySelectorAll(".progress")[0]
          progressDiv.parentNode.removeChild(progressDiv);
          document.querySelectorAll(".annotate_gem-gemfile")[0].innerHTML = "There was an error processing your Gemfile. Please file an issue at <a href='https://github.com/ivantsepp/annotate_gem-web/issues/new'>annotate_gem-web</a>. The error message is: " + status.message;
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
    if (gemfileText.value.length || gemfileUpload.value.length || gemfileTextarea.value.length) {
      removeClass(submitBtn, "disabled");
      submitBtn.disabled = false;
    } else {
      addClass(submitBtn, "disabled");
      submitBtn.disabled = true;
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
