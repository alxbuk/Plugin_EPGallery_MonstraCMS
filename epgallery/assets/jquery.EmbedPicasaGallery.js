(function($) {
    // setup a namespace for us
    var nsp = 'EmbedPicasaGallery', authkey;

    // Private Variables and Functions in the _ object
    // note that this will refer to _ unless you
    // call using the call or apply methods

    // Public Variables and Methods
    $[nsp] = {
        defaultOptions: {
            matcher : RegExp('.+'),
            size    : 72,
            msg_loading_list : 'Галерея загружается ждите...',
            msg_back : 'Back',
            album_title_tag: '<h2/>',
            thumb_id_prefix: 'pThumb_',
            thumb_tuner: null,
            thumb_finalizer: null,
            loading_animation: null,
            link_mapper: function(el){
                    return [
                        el.href,
                        '<a href="'+el.href+'">'+el.title+'</a>'
                    ]
                }
        } 
    };
    $.fn[nsp] = function(user,opts) {
        var localOpts,
            Cache = {};

        localOpts = $.extend( 
            {}, // start with an empty map
            $[nsp].defaultOptions, // add defaults
            opts // add options
        );

        function showOverview() {
            var $this,
                meta_opts,
                albumCount,
                $album_list,
                authkey = '';

            if ( Cache.__overview ){
                 Cache.__overview.show();
                 return;
            }
            $this = $(this);
            $this.empty();
            $this.append($('<br/>').css('clear','left'));
            meta_opts = localOpts;
            if ($.meta){
                meta_opts = $.extend({}, localOpts, $this.data());
            }
            albumCount = 0;
            $album_list = $('<div/>')
                .addClass('album-list')
                .append($('<div/>').text(meta_opts.msg_loading_list));

            $this.prepend($album_list);

            function appendImage(i,item){
                var title,$div,$img;
                title = item.media$group.media$title.$t;
                if (title.match(meta_opts.matcher)){
                    albumCount++;
                    $img = $('<img/>')
                        .attr('title',title)
                        .attr('src',item.media$group.media$thumbnail[0].url)
                    $div = $('<div/>')
                        .addClass('album-cover')
                        .css({
                            'float': 'left',
                            marginRight: '10px',
                            marginBottom: '10px'
                        })
                        .click(function () {
                           $album_list.hide();
                           showAlbum($this,meta_opts,item.gphoto$id.$t,title,item.gphoto$numphotos.$t);
                        })
                        .hover(
                            function () { $(this).css("cursor","pointer")},
                            function () { $(this).css("cursor","default")}
                        )
                        .append( $img )
                        .append(
                            $('<div/>')
                            .addClass('album-title')
                            .css({
                                'font-size': '10px'
                            })
                            .text(title)
                            .width( meta_opts.size )
                        )                    
                    $album_list.append($div);
                };
            }
            
            function renderAlbumList(data){
                var $albums,maxHeight=0;
                $album_list.empty();
        		if (data.feed && data.feed.entry){
    	            $.each(data.feed.entry,appendImage);
        		} else {
          		    $this.text('Warning: No picasa albums found for user ' + user);
		        }
                Cache.__overview = $album_list;
                $albums = $album_list.children();


                if (albumCount == 1){
                    $albums.eq(0).click();
                    return;
                }
                $('.album-title',$album_list)
                .each(function(){                        
                     var h = $(this).outerHeight();
                     if (h > maxHeight){
                        maxHeight = h
                     }
                })
                .each(function(){
                    $(this).height(maxHeight)
                });

            }


            if (meta_opts.authkey){
                authkey = '&authkey=' + meta_opts.authkey;
            }
 
    	    if (meta_opts.albumid) {
       	       showAlbum($this,meta_opts,meta_opts.albumid,'')
    	    }
	        else {
                $.getJSON('http://picasaweb.google.com/data/feed/api/user/' 
                    + user + '?kind=album&access=visible' + authkey 
                    + '&alt=json-in-script&thumbsize=' + meta_opts.size + 'c&callback=?',
                    renderAlbumList
               );
	        }
        };

        function showAlbum($this,meta_opts,album,title,photoCount){                        
            if ( Cache[album] ){
               Cache[album].show();
               return;
            };
            var i,$album,albumPics=[],$albumDiv;

            $album = $('<div/>').addClass('album');

            if (title){}

            function makeDiv(){
               $div = $('<div/>')
                   .width(meta_opts.size)
                   .height(meta_opts.size)
                   .css({
                        'float': 'left',
                        marginRight: '10px',
                        marginBottom: '10px'
                    });
               if (meta_opts.loading_animation){
                   $div.css('background','url(' + meta_opts.loading_animation + ') no-repeat center center');            
               }
               return $div;
            }

            if (Cache.__overview){
                $album.append($("<div/>")
                    .addClass("pic-thumb")
                    .width(meta_opts.size)
                    .height(meta_opts.size)
                    .css({'border-width': '0px',
                         'display' : 'none',
                         marginRight: '10px',
                         marginBottom: '10px'
                     })
                    .append($("<div/>")
                        .html('<br/>'+meta_opts.msg_back)
                        .click(function(){$album.hide();showOverview()})
                        .css({'border-style':'outset',
                              'border-width':'1px',
                              'text-align'  :'center',
                              'width'       : (meta_opts.size - 2) + 'px',
                              'height'      : (meta_opts.size - 2) + 'px'
                        })
                    )
                 );
             }
            
            if (photoCount){
                for (i=0;i<photoCount;i++) {
                    $albumDiv = makeDiv();
                    $album.append($albumDiv);
                    albumPics.push($albumDiv);
                }
            }

            function appendImage(i,item){
               var title, $img, $div, $a;
               title = item.media$group.media$title.$t;
               $img = $(new Image());
               $img.load(function(){                   
                    if (meta_opts.thumb_tuner){
                        meta_opts.thumb_tuner($div,item);
                    }
                    $img.show();
               })
               .css('','')
               .hide();
               $a = $("<a/>")
                   .attr("href",item.content.src)
                   .attr("title",title)
                   .append($img);

               if (($div = albumPics[i]) == undefined){
                    $div = makeDiv();  
                    $album.append($div);
               }

               $div
                   .attr("id", meta_opts.thumb_id_prefix + item.gphoto$id.$t )
                   .append($a)
               $img.attr("src", item.media$group.media$thumbnail[0].url);                
            }

            function renderAlbum(data){
                $.each(data.feed.entry,appendImage);

                if ($.fn.slimbox){
                    $('a',$album).slimbox({},meta_opts.link_mapper);
                }
                if (meta_opts.thumb_callback){
                    $('a',$album).each(meta_opts.thumb_callback);
                }
                Cache[album] = $album;
            }
            authkey = '';
            if (meta_opts.authkey){
               authkey = '&authkey=' + meta_opts.authkey;
            }
            $.getJSON('http://picasaweb.google.com/data/feed/api/user/' 
                + user + '/albumid/' 
                + album + '?kind=photo&access=visible' + authkey + '&alt=json-in-script&thumbsize='+meta_opts.size+'c&imgmax=800&callback=?',
                renderAlbum
            );
            $this.prepend($album);
        };

        return this.each(showOverview);
    };
})(jQuery);

/*!
	Slimbox v2.05 - The ultimate lightweight Lightbox clone for jQuery
	(c) 2007-2013 Christophe Beyls <http://www.digitalia.be>
	MIT-style license.
*/
(function(w){var E=w(window),u,f,F=-1,n,x,D,v,y,L,r,m=!window.XMLHttpRequest,s=[],l=document.documentElement,k={},t=new Image(),J=new Image(),H,a,g,p,I,d,G,c,A,K;w(

function(){w("body").append(w([
H=w('<div id="lbOverlay" />').click(C)[0],
a=w('<div id="lbCenter" />')[0],
G=w('<div id="lbBottomContainer" />')[0]]).css("display","none"));
g=w('<div id="lbImage" />').appendTo(a).append(
p=w('<div style="position: relative;" />').append([
I=w('<a id="lbPrevLink" href="#" />').click(B)[0],
d=w('<a id="lbNextLink" href="#" />').click(e)[0]])[0])[0];
c=w('<div id="lbBottom" />').appendTo(G).append([w('<a id="lbCloseLink" title="Закрыть" href="#" />').click(C)[0],
A=w('<div id="lbCaption" />')[0],
K=w('<div id="lbNumber" />')[0],w('<div style="clear: both;" />')[0]])[0]});w.slimbox=function(O,N,M){u=w.extend({loop:true,
overlayOpacity:0.8,
overlayFadeDuration:100,
resizeDuration:0,
resizeEasing:"swing",
initialWidth:0,
initialHeight:0,
imageFadeDuration:100,
captionAnimationDuration:0,
counterText:"Изображение {x} из {y}",
closeKeys:[27,88,67],
previousKeys:[37,80],
nextKeys:[39,78]},M);
if(typeof O=="string"){O=[[O,N]];N=0}y=E.scrollTop()+(E.height()/2);L=u.initialWidth;r=u.initialHeight;w(a).css({top:Math.max(0,y-(r/2)),width:L,height:r,marginLeft:-L/2}).show();v=m||(H.currentStyle&&(H.currentStyle.position!="fixed"));if(v){H.style.position="absolute"}w(H).css("opacity",u.overlayOpacity).fadeIn(u.overlayFadeDuration);z();j(1);f=O;u.loop=u.loop&&(f.length>1);return b(N)};w.fn.slimbox=function(M,P,O){P=P||function(Q){return[Q.href,Q.title]};O=O||function(){return true};var N=this;return N.unbind("click").click(function(){var S=this,U=0,T,Q=0,R;T=w.grep(N,function(W,V){return O.call(S,W,V)});for(R=T.length;Q<R;++Q){if(T[Q]==S){U=Q}T[Q]=P(T[Q],Q)}return w.slimbox(T,U,M)})};function z(){var N=E.scrollLeft(),M=E.width();w([a,G]).css("left",N+(M/2));if(v){w(H).css({left:N,top:E.scrollTop(),width:M,height:E.height()})}}function j(M){if(M){w("object").add(m?"select":"embed").each(function(O,P){s[O]=[P,P.style.visibility];P.style.visibility="hidden"})}else{w.each(s,function(O,P){P[0].style.visibility=P[1]});s=[]}var N=M?"bind":"unbind";E[N]("scroll resize",z);w(document)[N]("keydown",o)}function o(O){var N=O.which,M=w.inArray;return(M(N,u.closeKeys)>=0)?C():(M(N,u.nextKeys)>=0)?e():(M(N,u.previousKeys)>=0)?B():null}function B(){return b(x)}function e(){return b(D)}function b(M){if(M>=0){F=M;n=f[F][0];x=(F||(u.loop?f.length:0))-1;D=((F+1)%f.length)||(u.loop?0:-1);q();a.className="lbLoading";k=new Image();k.onload=i;k.src=n}return false}function i(){a.className="";w(g).css({backgroundImage:"url("+n+")",visibility:"hidden",display:""});w(p).width(k.width);w([p,I,d]).height(k.height);w(A).html(f[F][1]||"");w(K).html((((f.length>1)&&u.counterText)||"").replace(/{x}/,F+1).replace(/{y}/,f.length));if(x>=0){t.src=f[x][0]}if(D>=0){J.src=f[D][0]}L=g.offsetWidth;r=g.offsetHeight;var M=Math.max(0,y-(r/2));if(a.offsetHeight!=r){w(a).animate({height:r,top:M},u.resizeDuration,u.resizeEasing)}if(a.offsetWidth!=L){w(a).animate({width:L,marginLeft:-L/2},u.resizeDuration,u.resizeEasing)}w(a).queue(function(){w(G).css({width:L,top:M+r,marginLeft:-L/2,visibility:"hidden",display:"none"});w(g).css({display:"none",visibility:"",opacity:""}).fadeIn(u.imageFadeDuration,h)})}function h(){if(x>=0){w(I).show()}if(D>=0){w(d).show()}w(c).css("marginTop",-c.offsetHeight).animate({marginTop:0},u.captionAnimationDuration);G.style.visibility=""}function q(){k.onload=null;k.src=t.src=J.src=n;w([a,g,c]).stop(true);w([I,d,g,G]).hide()}function C(){if(F>=0){q();F=x=D=-1;w(a).hide();w(H).stop().fadeOut(u.overlayFadeDuration,j)}return false}})(jQuery);

// AUTOLOAD CODE BLOCK (MAY BE CHANGED OR REMOVED)
if (!/android|iphone|ipod|series60|symbian|windows ce|blackberry/i.test(navigator.userAgent)) {
	jQuery(function($) {
		$("a[rel^='lightbox']").slimbox({/* Put custom options here */}, null, function(el) {
			return (this == el) || ((this.rel.length > 8) && (this.rel == el.rel));
		});
	});
}