Плагин EPGallery - Встроенная Picasa галерея by AlxBuk

Подключается к альбому пользователя и отображает картинки через SlimBox



Установка
1 - Скопировать папку epgallery в папку plugins

2 - В шаблоне в разделе <head> подключить скрипт jQuery

<script type="text/javascript" src="http://code.jquery.com/jquery.min.js" ></script> 
или свой.



Использование через шорткод    {epg user="alexbukfam" album="Ершов В.В. и его Ту 154" div="ershov"}


user="alexbukfam" - имя Google юзера

album="Ершов В.В. и его Ту 154" - альбом Google юзера

div="ershov" - id div блока (на случай если их будет много)



Примечание

Плагин работает ТОЛЬКО! при условии подключения jQuery в разделе <head>

Если jQuery подключен и в разделе <head> и собирается в футере - плагин работать НЕ БУДЕТ

Если jQuery подключен и собирается в футере - плагин работать НЕ БУДЕТ



Для гиков

slimbox2.css - загружается через минификацию



В файле jquery.EmbedPicasaGallery.js собрано 2 файла
 
 - сам jquery.EmbedPicasaGallery.js

 - и slimbox2.js внизу
