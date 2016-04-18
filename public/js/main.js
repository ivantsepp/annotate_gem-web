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

  if (window.jobID){
    getStatus(window.jobID);
  }

}());
