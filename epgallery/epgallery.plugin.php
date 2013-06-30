<?php
/**
*  EmbedPicasaGallery
*
*  @package Monstra
*  @subpackage Plugins
*  @author AlxBuk
*  @copyright 2013 AlxBuk.ru
*  @version 1.0.0
*
*/
// Register plugin


Plugin::register( __FILE__,                    
__('EPGallery'),
__('EmbedPicasaGallery - Встроенная Picasa галерея'),  
'1.0.0',
'AlxBuk',                 
'http://alxbuk.ru/');


if (!BACKEND) 
Stylesheet::add('plugins/epgallery/assets/slimbox2.css', 'frontend', 11);
Shortcode::add('epg', 'epg::show');


class epg {
	public static function show($attributes){
		extract($attributes);
		$guser = $user;
		$galbum = $album;
		$divid = $div;
		if(isset($user)) {return '
<script type="text/javascript" src="../../plugins/epgallery/assets/jquery.EmbedPicasaGallery.js"></script>
<script type="text/javascript">
	jQuery(document).ready(function(){jQuery("#'.$divid.'").EmbedPicasaGallery("'.$guser.'",{loading_animation: "../cssloading.gif",matcher: /'.$galbum.'/});})
</script>
<div id="'.$divid.'" class="epg"></div>';}
}}