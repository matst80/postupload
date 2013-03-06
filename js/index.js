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
        
        if (app.baseurl && app.baseurl.length)
        {
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
            

            request.open("POST", app.baseurl+'/Core.Blogger,Core.Blogger.BlogService.asmx/'+cmd);
            request.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            var data = JSON.stringify(data);
            con.log(data);
            request.send(data);
        }
        else
            err({error:'No baseurl'});
    },
    baseurl:'http://blickevent7.wd6.se',
    initialize: function() {
        document.body.className = '';
        this.bind();
    },
    autosize:function(id) {
        var text = document.getElementById(id);
        function resize () {
            text.style.height = 'auto';
            text.style.height = text.scrollHeight+'px';
        }
        
        function delayedResize () {
            window.setTimeout(resize, 0);
        }
        
        text.addEventListener('change',resize,false);
        text.addEventListener('cut',delayedResize,false);
        text.addEventListener('paste',delayedResize,false);
        text.addEventListener('drop',delayedResize,false);
        text.addEventListener('keydown',delayedResize,false);
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        app.stat = document.getElementById('status');
        
        document.getElementById('tgldebug').addEventListener('click',function() {
            var el = document.getElementById('info');
            el.style.display=(el.style.display=='block')?'none':'block';
        },false);
        this.imgElm = document.getElementById('uplbtn');
        document.getElementById('selfile').addEventListener('click',this.selectImage,false);
        document.getElementById('selcamera').addEventListener('click',this.cameraImage,false);
        document.getElementById('dopublish').addEventListener('click',this.publish,false);

        app.autosize('description');
        app.autosize('ingress');

        var loginbtn = document.getElementById('dologin');
        
        loginbtn.addEventListener('click',function() {
                app.baseurl = document.getElementById('baseurl').value;
                app.username = document.getElementById('username').value;
                app.password = document.getElementById('password').value;

                if (app.baseurl.indexOf('http://')==-1)
                    app.baseurl = 'http://'+app.baseurl;

                document.getElementById('login').className = 'loading';
                app.testuser(function(ok) {
                    if (!ok)
                        document.getElementById('login').className = '';
                    else
                    {
                        window.localStorage.setItem("baseurl",app.baseurl);
                        window.localStorage.setItem("username",app.username);
                        window.localStorage.setItem("password",app.password);
                    }
                });
        },false);
        app.testuser(function(ok) {
            if (ok)
            {
                con.log({username:username});
                var bsel = document.getElementById('blogid');
                for(var i in app.settings) {
                    var s = app.settings[i];
                    con.log(s);
                    var opt = document.createElement('option');
                    opt.value = s.PageId,
                    opt.innerHTML = s.Name;
                    bsel.appendChild(opt);
                }
            }
            else {
                document.getElementById('login').className = '';
            }
        });

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
       
        navigator.camera.getPicture(function(imageURI) {
       
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
                //con.log(r);
                app.imgElm.className = 'button media upload';
                app.stat.innerHTML = 'Bilden sparad!';
                if (app.postid && app.postid>0)
                    ar('BindImage',{
                        pid:app.postid, 
                        file:r.response
                    },function() {
                        con.log('image bound');
                    },function() {
                        con.log('imagebindfail');
                    });
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
                username:app.username,
                password:app.password,
                //username:"testuser",
                //password:"test100%",
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
        if (!app.username)
            cb(false);
        this.ar('TestUser',{username:app.username,password:app.password},function(d) {
            con.log(d);
            app.settings = d.d;
            cb(d.d);
        },function() {
            cb(false);
        });
    },
    deviceready: function() {
        con.log(app);
        app.username = window.localStorage.getItem("username");
        app.password = window.localStorage.getItem("password");
        app.baseurl = window.localStorage.getItem("baseurl");
        if (app.baseurl) {
            document.getElementById('baseurl').value = app.baseurl;
            document.getElementById('password').value = app.password;
            document.getElementById('username').value = app.username;
        }
    }
};

