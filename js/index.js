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
        con.log("running:"+cmd,request);
        request.open("POST", app.baseurl+'/Core,Core.WebServices.PostPublish.asmx/'+cmd);
        request.setRequestHeader('Content-type', 'html/json');
        var data = JSON.stringify(data);
        con.log(data);
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
            dosend();
        }, function() {
            con.log('errorlocation');
            dosend();
        });
        
        
    },
    deviceready: function() {
        // This is an event handler function, which means the scope is the event.
        // So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

        

        
        var pictureSource=navigator.camera.PictureSourceType;
        var destinationType=navigator.camera.DestinationType;
        con.log(destinationType);
        navigator.camera.getPicture(function(imageURI) {
            //alert('fått bild');
            //app.lastimg = imageData;
            var smallImage = document.getElementById('theimg');
            smallImage.style.display = 'block';
            smallImage.src = "data:image/jpeg;base64," + imageData;


 var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpeg";

            var params = new Object();
            params.value1 = "test";
            params.value2 = "param";

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(imageURI, app.baseurl+"//Userfiles/?upFile=/Userfiles/", function(r) {
                con.log(r);
            }, function(e) {
                con.log(e);
            }, options);

            
        }, function() {
            alert('nejdu');
        }, { quality: 90, destinationType: navigator.camera.DestinationType.FILE_URI,
                                        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }); //, destinationType: destinationType.DATA_URL

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

