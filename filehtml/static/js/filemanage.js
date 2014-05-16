$(function(){

//    $.ajaxPrefilter(function(options,originalOptions,jqXHR){
//       options.url = 'http://10.140.42.3:50000';
//
//    });

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    $('#uploadForm').tooltip({
        selector: "a[data-toggle=tooltip]",
        placement: "bottom"
    });

    var formatSize = function(size) {
            if(size) {
                var i = -1;
                var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
                do {
                    size = size / 1024;
                    i++;
                } while (size > 1024);

                return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
            }
            return size;
        };

    var NavItem = Backbone.Model.extend({
        defaults:{
            name:"Home",
            path:""
        }
    });

    var NavItemList = Backbone.Collection.extend({
        model:NavItem
    });

    var NavView = Backbone.View.extend({
        el: "#nav-items",
        tagName: "li",
        className: "nav-item",

        events:{
          'click a': 'listFolder'
        },

        listFolder:function(){
            router.navigate('/#/'+appview.curPath);
        },

        render: function(){
            var   template = _.template($('#nav-template').html(),{navs:navItems.models});
            $(this.el).html(template);
        }

    });

    var FileItem = Backbone.Model.extend({
        idAttribute: "name",
        defaults:{
            name: "",
            folder: true,
            size: 0,
            modifyDate: "" ,
            fullPath:""
        } ,
        truncate: function(n, len) {
            var ext = n.substring(n.lastIndexOf(".") + 1, n.length).toLowerCase();
            var filename = n.replace('.' + ext,'');
            if(filename.length <= len) {
                return n;
            }
            filename = filename.substr(0, len) + (n.length > len ? '...' : '');
            return filename + '.' + ext;
        },
        initialize: function() {
            this.set('prettySize', this.prettyFileSize());
            this.set('prettyDate', this.prettyDate());
            this.set('shortname', this.truncate(this.get('name'), 64));
//            this.set('path', this.get('path').replace('+', '%2B'));
            this.set('isfolder',this.isfolder());
            this.set('ext','');
            this.set('path','');
            this.set('fullPath','');
            this.set('contenttype','');
        },

        isfolder:function(){
             var folder = this.get('folder');
             if("1"==folder)
                return "folder"
             return "file"
        },

        prettyDate: function() {
            var lastModified = this.get('modifyDate');
            if(lastModified) {
                return moment(lastModified).format("YYYY-MM-DD HH:mm:ss")
            }
            return '';
        },
        prettyFileSize: function() {
                return formatSize(this.get('size'));
            }

    });

    var FileItemList = Backbone.Collection.extend({
       model:FileItem,
//        url:"/folder"
        url:"/d3a/"

    });

    var FileView = Backbone.View.extend({
        el:"#item-list tbody",
//        tagName:"tr",
        className:"file-row",
//        parentPath:"",

        events :{
            "click .op button.download": "download",

            "click .op button.delete": "destroy"
        } ,


        initialize: function(){
            _.bindAll(this,'openFolder');
            this.model = folderItems;
            this.model.bind('add',this.resetModel,this);
//            folderItems.bind('add',this.resetModel,this)

        },

        download:function(ev){
            var path = $(ev.currentTarget).parents('tr').attr('id');

            if (path.substring(0, 1) =='/'){
                path="/d3a"+path
            }
            else{
                path="/d3a/"+path
            }
            console.log("download: "+path);
            window.open(path);

        },
        destroy : function(ev){
            var path = $(ev.currentTarget).parents('tr').attr('id');
            var name = $(ev.currentTarget).parents('tr').attr('data-name');
            alert(path);
//            alert(name)
            var item = this.model.get(name);
            var linkpath;
            if (appview.curPath.substring(0, 1) =='/'){
                linkpath= "/d3a"+ path ;
            }
            else{
                linkpath= "/d3a/"+ path;
            }

            bootbox.confirm("Are you sure to delete '"+ name +"' ?", function(confirmed) {
                if(confirmed)   {
                    $.ajax({
                        url: linkpath,
                        type: "DELETE",
                        data: formData,
                        cache: false,
//                        contentType: false,
                        processData: false,
                        success: function(data) {
                            console.log("delete an  item from:"+linkpath)
                            if (appview.curPath.substring(0, 1) =='/')
                                router.navigate('/#'+appview.curPath);
                            else
                                router.navigate('/#/'+appview.curPath);
                        }
                    });
                }
            });

//            this.el.remove(item)
//            folderItems.remove(item)
//            this.model.remove(item)

        },
        resetModel: function(){
            var   template = _.template($('#item-template').html(),{files:folderItems.models,curpath:""});
            $(that.el).html(template);
        },

        render: function(path_opt){
          //  folderItems = new  FileItemList();
//            if('/'== path_opt){
//                path_opt ='';
//
//            }
            appview.curPath = path_opt
            if(''!=path_opt){

                if (appview.curPath.substring(0, 1) =='/'){
                    folderItems.url = '/d3a'+ path_opt;
                }
                else{
                    folderItems.url = '/d3a/'+ path_opt;
                }
            }


           that = this;
            folderItems.fetch({
                success: function(){


                  if(!endsWith(appview.curPath,'/') ){
                      appview.curPath +="/"

                      console.log("appview.curPath: "+ appview.curPath)
                  }
                  var   template = _.template($('#item-template').html(),{files:folderItems.models,curpath:appview.curPath});
                    $(that.el).html(template);

                }
            }) ;
            return this;
        },

        openFolder:function(path_opt){
            this.render(path_opt)
        }
    });


    var AppView = Backbone.View.extend({
        el: "#file-explorer" ,
        curPath:"",
        events: {
            'click a.browse': 'browse',
            "change input.pick" : "upload" ,
            "submit #uploadForm"  :"submitForm"
        },

        browse: function() {
            this.$("input.pick").trigger('click');
            return false;
        },
        upload: function() {
            this.$("input.pick").closest('form').submit();
            this.$("input.pick").val('');
            return false;
        },
        submitForm:function(formdata){
            console.log("submit a form ")
            var $form, formData,linkpath;
            $form = $("form#uploadForm");
            formData = new FormData($form[0]);
            if (appview.curPath.substring(0, 1) =='/'){
                linkpath= "/d3a"+ appview.curPath ;
            }
            else{
                linkpath= "/d3a/"+ appview.curPath;
            }
            console.log('post file to: '+linkpath)
            $.ajax({
                url: linkpath,
                type: "POST",
                data: formData,
                cache: false,
                contentType: true,
                processData: false,
                success: function(data) {
                    console.log("new a file ")
                }
            }) ;

        }
    });


    var  EditFolderView = Backbone.View.extend({
        el: "#file-explorer" ,
        curPath:"",
        events: {
            'click .mkdir': 'editfolder'
        },

        editfolder: function() {
            var linkpath=""
            if (appview.curPath.substring(0, 1) =='/'){
                linkpath= "/d3a"+ appview.curPath ;
            }
            else{
                linkpath= "/d3a/"+ appview.curPath ;
            }
            bootbox.prompt("New folder name", function(result) {
                if (result) {
                    console.log("post path:"+ linkpath);
                    $.ajax({
                        type: "POST",
                        url: linkpath + result,
                        data: {act: 'mkdir'},
                        success: function(data){
                            if (appview.curPath.substring(0, 1) =='/')
                                router.navigate('/#'+appview.curPath);
                            else
                                router.navigate('/#/'+appview.curPath);
//                        this.rpath= appview.curPath+"";
//                        curItem = new FileItem(data);
//                            folderItems.add(curItem)
                        }
                    });
                }
            });
        }
    }) ;

//    var uploadFileView =  Backbone.View.extend({
//        el: "#file-explorer" ,
//        curPath:"",
//        events: {
//
//            "submit"  :"submitForm"
//        },
//
//        submitForm: function(){
//            curPath =   appview.curPath
//        }
//    }) ;


    var Router = Backbone.Router.extend({
        routes :{
            '': 'home',
            '*folder' :'navigate'
//            '/': 'home1'

        }
    }) ;
    var folderItems = new FileItemList();

    var fileview = new FileView();
    fileview.model = folderItems;
    var appview = new AppView();
    var navview = new NavView();
    var eidtfolder = new EditFolderView();
    var router = new Router();



    var navItems = new NavItemList();
    navItems.add(new NavItem({name:'Home',path:''}));

    router.on('route:home',function(){
        fileview.render('');
        navview.render();
    });

//    router.on('route:home1',function(folder){
//        console.log("got home1")
//        fileview.openFolder(folder);
//    });
    router.on('route:navigate',function(folder){
        var parts = _.compact(folder.split('/'));
        if(parts.length) {
            appview.curPath = folder;
            navItems._reset();
            navItems.add(new NavItem({name:'Home',path:''}));
            for(var i=0; i < parts.length; i++) {
                var p = _.first(parts, i + 1).join('/');
                p = '#/'+p;
                navItems.add(new NavItem({name: parts[i], path: p}));
            }

        }
        navview.navs =navItems;
        navview.render();
        fileview.openFolder(folder);
    });
    Backbone.history.start();

});