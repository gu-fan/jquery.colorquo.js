ColorQuo: jQuery color picker plug-in
=======================================

Author: Rykka G.F
Github: https://github.com/Rykka/jquery.colorquo.js

ColorQuo is forked from  Farbtastic

    Farbtastic is a [jQuery](http://jquery.com/) plug-in that can add one or more
    color picker widgets into a page. Each widget is then linked to an existing
    element (e.g. a text field) and will update the element's value when a color is
    selected.

    Farbtastic uses *layered transparent PNGs* to render a saturation/luminance
    gradient inside of a hue circle. No Flash or pixel-sized divs are used.

    Farbtastic was originally written by [Steven Wittens](http://acko.net/) and is
    licensed under the GPL.

Basic Usage
-----------

1) a. colorquo 2: include colorquo.js in your HTML:
   
      <script type="text/javascript" src="colorquo.js"></script>

   b. colorquo 1: include colorquo.js and colorquo.css in your HTML:
   
      <link rel="stylesheet" type="text/css" href="colorquo.css"/>
      <script type="text/javascript" src="colorquo.js"></script>

2) Add a placeholder div and a text field to your HTML, and give each an ID:

    <form><input type="text" id="color" name="colorValue" value="#123456" /></form>
    <div id="colorpicker"></div>

3) Add a `ready()` handler to the document which initializes the color picker
   and link it to the text field with the following syntax:

    <script type="text/javascript">
      $(document).ready(function() {
        $("#colorpicker").colorquo({callback: "#color");
      });
    </script>

   or you can use second method:

    <script type="text/javascript">
      $(document).ready(function() {
        $.colorquo.init($("#colorpicker"), {callback: "#color");
      });
    </script>

See `demo.html` for an example.

Advanced Usage
--------------

### jQuery Method

	$(placeholder).colorquo()
	$(placeholder).colorquo(callback)

This creates color pickers in the selected objects. `callback` is optional and
can be a:

* DOM Node, jQuery object or jQuery selector: the color picker will be linked to
  the selected element(s) by syncing the value (for form elements) and color
  (all elements).
* Function: this function will be called whenever the user chooses a different
  color.

### Object

	$.colorquo.init($(placeholder))
	$.colorquo.init($(placeholder), callback)

Invoking `$.colorquo.init($(placeholder))` is the same as using `$(placeholder).colorquo()`.
After initialization colorquo object available through $(placeholder).data("colorquo").
This allows you to use the colorquo methods and properties below.

**Note** that there is only one colorquo object per placeholder. If you call
`$.colorquo.init($(placeholder))` twice with the same placeholder, you will get the
same object back each time.

The optional callback argument behaves exactly as for the jQuery method.

### Methods

`.linkTo(callback)` - Allows you to set a new callback. Any existing callbacks
  are removed. See above for the meaning of callback.

`.setColor(string)` - Sets the picker color to the given color in hex representation.

`.setColor([h, s, l])` - Sets the picker color to the given color in normalized
  HSL (0..1 scale).

### Properties

`.linked` - The elements (jQuery object) or callback function this picker is
  linked to.

`.color` - Current color in hex representation.

`.hsl` - Current color in normalized HSL.

### Options

	$(placeholder).colorquo(options)

	or

	$.colorquo.init($(placeholder), options)

colorquo provides the ability to pass in other options beyond a callback.
The possible options are:

* callback: the callback as described previously
* color: set color at begining
* height: the height of the widget
* width: the width of the widget

An example usage would be `$(placeholder).colorquo({ callback: "#color2", width: 150 })`.

ColorQuo 1: Styling
---------------------

The color picker is a block-level element and is 150x150 pixels large. You can
control the position by styling your placeholder (e.g. floating it).

Tested with
-----------

jQuery 1.8.3 & Chrome 10, Firefox 4, Opera 11
