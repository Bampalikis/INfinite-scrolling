<html><body>
<div id="test">scroll to understand</div>
<div id="wrapper" style="height: 400px; overflow: auto;">
  <div id="content"> </div>
</div>

<script language="JavaScript">
  // we will add this content, replace for anything you want to add
  var more = '<div style="height: 1000px; background: #EEE;"></div>';

  var wrapper = document.getElementById("wrapper");
  var content = document.getElementById("content");
  var test = document.getElementById("test");
  content.innerHTML = more;

  // cross browser addEvent, today you can safely use just addEventListener
  function addEvent(obj,ev,fn) {
    if(obj.addEventListener) obj.addEventListener(ev,fn,false);
    else if(obj.attachEvent) obj.attachEvent("on"+ev,fn);    
  }

   // this is the scroll event handler
  function scroller() {
    // print relevant scroll info
    test.innerHTML = wrapper.scrollTop+"+"+wrapper.offsetHeight+"+100>"+content.offsetHeight;

    // add more contents if user scrolled down enough
    if(wrapper.scrollTop+wrapper.offsetHeight+100>content.offsetHeight) {
      content.innerHTML+= more;
    }
  }

  // hook the scroll handler to scroll event
  addEvent(wrapper,"scroll",scroller);
</script>
</body></html>