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
    lat:'0',
    ar:function(cmd,data,cb,err) {
        var request = new XMLHttpRequest();
        
        request.onload = function() {
            con.log(request);
            if (cb)
                cb(eval('(' + request.response + ')'));

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
        document.body.className = '';
        this.bind();
    },

    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        app.stat = document.getElementById('status');
        
        document.getElementById('tgldebug').addEventListener('click',function() {
            var el = document.getElementById('info');
            el.style.display=(el.style.display=='block')?'none':'block';
        },false);
        this.imgElm = document.getElementById('selectimage');
        document.getElementById('selfile').addEventListener('click',this.selectImage,false);
        document.getElementById('selcamera').addEventListener('click',this.cameraImage,false);
        document.getElementById('dopublish').addEventListener('click',this.publish,false);
        navigator.geolocation.getCurrentPosition(function(a) {
            app.lat = a.coords.latitude;
            app.lng = a.coords.longitude;
            document.getElementById('hasgeo').style.display = 'block';
            
        }, function() {
            con.log('errorlocation');
        });
    },
    cameraImage:function() {
        app.fetchImage(navigator.camera.PictureSourceType.CAMERA);
    },
    selectImage:function() {
        app.fetchImage(navigator.camera.PictureSourceType.PHOTOLIBRARY);
    },
    fetchImage:function(typ) {
        var pictureSource=navigator.camera.PictureSourceType;
        var destinationType=navigator.camera.DestinationType;
        con.log(destinationType);
        navigator.camera.getPicture(function(imageURI) {
            //alert('fått bild');
            //app.lastimg = imageU;
            var smallImage = document.getElementById('imgpreview');
            
            smallImage.src = imageURI;
            smallImage.style.display = 'block';
            smallImage.className = 'appeardown loading';

            app.stat.innerHTML = 'Laddar upp...';
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
                app.stat.innerHTML = 'Bilden sparad!';
                if (app.postid && app.postid>0)
                    ar('BindImage',{},function() {con.log('image bound');},function() {con.log('imagebindfail');});
                smallImage.className = 'appeardown';
                navigator.notification.vibrate(50);
                app.lastimg = r.response;
            }, function(e) {
                app.stat.innerHTML = 'Fel vid uppladdning!';
                navigator.notification.vibrate(300);
                smallImage.className = 'appeardown error';
                con.log(e);
                app.imgElm.className = 'button media upload error';
            }, options);

            
        }, function() {
            alert('Filen kunde inte laddas upp');
        }, { quality: 90, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType: typ }); //, destinationType: destinationType.DATA_URL
    },
    publish:function() {
        var btn = document.getElementById('dopublish');
        btn.className = 'button publish loading';
        app.stat.innerHTML = 'Publicerar!';
        function dosend() {
            app.postid = 0;
            app.ar('Publish',{
                username:"testuser",
                password:"test100%",
                title:document.getElementById('title').value,
                body:document.getElementById('description').value.replace(/\n/ig,'<br />'),
                imgdata:app.lastimg||'',
                lat:app.lat,
                lng:app.lng,
                blog:17
            },function(d) {
                con.log(d);
                app.stat.innerHTML = 'Klar!';
                btn.className = 'button publish';
                navigator.notification.vibrate(50);
                document.getElementById('title').value = '';
                document.getElementById('description').value = '';
                document.getElementById('imgpreview').style.display = 'none';
                app.postid = d.d.PageId;
            },function() {
                app.stat.innerHTML = 'Något gick fel.';
                navigator.notification.vibrate(350);
                btn.className = 'button publish';
                alert('Något gick fel vid publiseringen');
            }); 
        }
        dosend();        
    },
    testuser:function(cb) {
        this.ar('TestUser',{username:app.username,password:app.password},function(d) {
            cb(d);
        },function() {
            cb(false);
        });
    },
    deviceready: function() {
        
        app.username = window.localStorage.getItem("username");
        app.password = window.localStorage.getItem("password");
        var loginbtn = document.getElementById('dologin');
        
        loginbtn.addEventListener('click',function() {
                username = app.username = document.getElementById('username').value;
                password = app.password = document.getElementById('password').value;

                document.getElementById('login').className = 'loading';
                this.testuser(function(ok) {
                    if (!ok)
                        document.getElementById('login').className = '';
                    else
                    {
                        window.localStorage.getItem("username",app.username);
                        window.localStorage.getItem("password",app.password);
                    }
                });
        },false);
        app.testuser(function(ok) {
            if (ok)
            {
                con.log({username:username});

            }
            else {
                document.getElementById('login').className = '';
            }
        });
    }
};

