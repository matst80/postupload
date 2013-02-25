
var app = {
    ar:function(cmd,data,cb,err) {
        var request = new XMLHttpRequest();
        request.open("GET", app.baseurl+'/Core,Core.WebServices.PostPublish.asmx/'+cmd, true);
        request.onreadystatechange = function() {//Call a function when the state changes.
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    var data = JSON.parse(request.responseText);
                    cb(data);
                }
            }
        }
        console.log("running:"+cmd);
        request.send();
    },
    baseurl:'http://blickevent7.wd6.se',
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    publish:function() {
        alert('publish');
        
        app.ar('Publish',{username:"testuser",password:"test100%",title:document.getElementById('title').value,body:document.getElementById('bodytxt').value,imgdata:app.lastimg,lat:"16",lng:"18",17},function(d) {
            console.log(d);
            alert(d.PageId);
        });
    },
    deviceready: function() {
        // This is an event handler function, which means the scope is the event.
        // So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

        document.getElementById('theimg').addEventListener('click',this.publish,false)

        
        var pictureSource=navigator.camera.PictureSourceType;
        var destinationType=navigator.camera.DestinationType;

        navigator.camera.getPicture(function(imageData) {
            alert('fått bild');
            app.lastimg = imageData;
            var smallImage = document.getElementById('theimg');
            smallImage.style.display = 'block';
            smallImage.src = "data:image/jpeg;base64," + imageData;

        }, function() {
            alert('nejdu');
        }, { quality: 90, destinationType: destinationType.DATA_URL });

    },
    report: function(id) {
        // Report the event in the console
        console.log("Report: " + id);

        // Toggle the state from "pending" to "complete" for the reported ID.
        // Accomplished by adding .hide to the pending element and removing
        // .hide from the complete element.
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    }
};
