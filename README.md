# Clickable
Clickable is an easy-to-use slideshow and multidimensional content navigator constructor. Clickable makes it easy to establish different types of content flows: linear, targetted, and nested navigation. Clickable doesn't care about styles, it doesn't care about scripts. It's only job is to link dom element click events with navigation and to give the correct elements an active class. 

Some things Clickable is good for:
-   establishing a slideshow navigation flow ( linear )
-   establishing a choice-based navigation flow ( targetted )
-   establishing a context-base navigation flows ( nested )


##Examples:
Check out all of the examples in **examples/index-linear.html**, **examples/index-targetted.html**, and **examples/index-nested.html**

###Basic Usage:
    <div class="js-clickable-interaction">
      <div class="js-clickable-content-area"> First Section</div>
      <div class="js-clickable-content-area"> Second Section </div>
      <div class="js-clickable-prev">prev</div>
      <div class="js-clickable-next">next</div>            
    </div>
		<script>
			new Clickable()
		</script>
		//will produce a slideshow navigation for the js-clickable-interaction.
