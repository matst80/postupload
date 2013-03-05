var con = {
    log:function(a) {
        var el = document.getElementById('info');
        if (typeof(a)=='object')
            a = JSON.stringify(a);
        el.innerHTML+=a+'<br/>';
    }    
};
var app = {
    ar:function(cmd,data,cb,err) {
        var request = new XMLHttpRequest();
        //fileUpload = request.upload;
        request.onload = function() {
            console.log(request);

        };
                request.onerror = function() {
            console.log('error',request);

        };
         /*
         fileUpload.addEventListener("progress", function (e, a) {
                    console.log(this,e,a);
                    
                }, false);
                fileUpload.addEventListener("loadend",function(e) {
                    console.log(request.responseText);
                        
                },false);
        fileUpload.addEventListener("error", function (e, a) {
                    //console.log(arguments);
                    console.log('error',arguments,request);
                }, false);*/
        console.log("running:"+cmd,request);
        request.open("POST", app.baseurl+'/Core,Core.WebServices.PostPublish.asmx/'+cmd);
        request.setRequestHeader('Content-type', 'html/json');
        var data = JSON.stringify(data);
        console.log(data);
        request.send(data);
    },
    baseurl:'http://blickevent7.wd6.se',
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        document.getElementById('doupload').addEventListener('click',this.publish,false);
    },
    publish:function() {
        alert('publish');
        var lng = '0';
        var lat = '0';

        function dosend() {
            app.ar('Publish',{
                username:"testuser",
                password:"test100%",
                title:document.getElementById('title').value,
                body:document.getElementById('bodytxt').value,
                imgdata:'',
                lat:lat,
                lng:lng,
                blog:17
            },function(d) {
                con.log(d);
                alert(d.PageId);
            }); 
        }

        navigator.geolocation.getCurrentPosition(function(a) {
            lat = a.coords.latitude;
            lng = a.coords.longitude;
        }, function() {
            con.log('errorlocation');
        });
        
        
    },
    deviceready: function() {
        // This is an event handler function, which means the scope is the event.
        // So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

        

        
        var pictureSource=navigator.camera.PictureSourceType;
        var destinationType=navigator.camera.DestinationType;
        con.log(destinationType);
        navigator.camera.getPicture(function(imageData) {
            alert('fått bild');
            app.lastimg = imageData;
            var smallImage = document.getElementById('theimg');
            smallImage.style.display = 'block';
            smallImage.src = "data:image/jpeg;base64," + imageData;


             var xhr = new XMLHttpRequest(),
            fileUpload = xhr.upload;
            fileUpload.addEventListener("progress", function (e, a) {
                con.log('prog',e,a);
            });
            fileUpload.addEventListener("loadend",function(e) {
                app.serverfile = xhr.responseText;
                con.log(xhr.responseText);
            });
            fileUpload.addEventListener("error", function (e, a) {
                con.log('error',e);
            });
            xhr.open("POST", app.baseurl+ "/Userfiles/?upFile=/Userfiles/mobilefiles/");
            xhr.send(imageData);
        }, function() {
            alert('nejdu');
        }, { quality: 90, destinationType: destinationType.DATA_URL }); //, destinationType: destinationType.DATA_URL

    },
    report: function(id) {
        // Report the event in the console
        con.log("Report: " + id);

        // Toggle the state from "pending" to "complete" for the reported ID.
        // Accomplished by adding .hide to the pending element and removing
        // .hide from the complete element.
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    }
};
