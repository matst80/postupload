var con = {
    log:function(a) {
        var el = document.getElementById('info');
        if (typeof(a)=='object')
            a = JSON.stringify(a);
        el.innerHTML+=a+'<br/>';
    }    
};
var app = {
    lng:'0',
    lat:'',
    ar:function(cmd,data,cb,err) {
        var request = new XMLHttpRequest();
        
        request.onload = function() {
            con.log(request);
            if (cb)
                cb();

        };
        request.onerror = function() {
            con.log(request);
            if (err)
                err();
        };
        

        request.open("POST", app.baseurl+'/Core,Core.WebServices.PostPublish.asmx/'+cmd);
        request.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
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

        
        document.getElementById('tgldebug').addEventListener('click',function() {
            var el = document.getElementById('info');
            el.style.display=(el.style.display=='block')?'none':'block';
        },false);
        this.imgElm = document.getElementById('selectimage');
        document.getElementById('selectimage').addEventListener('click',this.selectImage,false);
        document.getElementById('dopublish').addEventListener('click',this.publish,false);
        navigator.geolocation.getCurrentPosition(function(a) {
            lat = a.coords.latitude;
            lng = a.coords.longitude;
            document.getElementById('hasgeo').style.display = 'block';
            
        }, function() {
            con.log('errorlocation');
        });
    },
    selectImage:function() {
        var pictureSource=navigator.camera.PictureSourceType;
        var destinationType=navigator.camera.DestinationType;
        con.log(destinationType);
        navigator.camera.getPicture(function(imageURI) {
            //alert('fått bild');
            //app.lastimg = imageU;
            var smallImage = document.getElementById('imgpreview');
            
            smallImage.src = imageURI;
            smallImage.style.display = 'block';
            smallImage.className = 'appeardown';


            app.imgElm.className = 'button media upload loading';

            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+".jpg";
            options.mimeType="image/jpeg";

            var params = new Object();
            params.value1 = "test";
            params.value2 = "param";

            options.params = params;

            var ft = new FileTransfer();
            ft.upload(imageURI, app.baseurl+"/Userfiles/?upFile=/Userfiles/mobile/", function(r) {
                con.log(r);
                app.imgElm.className = 'button media upload';
                if (app.postid && app.postid>0)
                    ar('BindImage',{},function() {con.log('image bound');},function() {con.log('imagebindfail');})
                app.lastimg = r.response;
            }, function(e) {
                con.log(e);
                app.imgElm.className = 'button media upload error';
            }, options);

            
        }, function() {
            alert('Filen kunde inte laddas upp');
        }, { quality: 90, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }); //, destinationType: destinationType.DATA_URL
    },
    publish:function() {
        alert('publish');
        var lng = '0';
        var lat = '0';

        function dosend() {
            app.postid = 0;
            app.ar('Publish',{
                username:"testuser",
                password:"test100%",
                title:document.getElementById('title').value,
                body:document.getElementById('description').value.replace(/\n/ig,'<br />'),
                imgdata:app.lastimg||'',
                lat:lat,
                lng:lng,
                blog:17
            },function(d) {
                con.log(d);
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('imgpreview').style.display = 'none';
                app.postid = d.PageId;
            },function() {
                alert('Något gick fel vid publiseringen');
            }); 
        }

        dosend();
        
        
    },
    deviceready: function() {
        // This is an event handler function, which means the scope is the event.
        // So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');

        

        
        

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

