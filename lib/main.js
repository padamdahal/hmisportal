
  $(document).ready(function() {
	  
	$( ".dr" ).click(function( event ) {
		event.preventDefault();
	});
	
    $(".style-selector select").each(function() {
      return $(this).find("option:first").attr("selected", "selected");
    });
	
    $(".style-toggle").bind("click", function() {
      if ($(this).hasClass("open")) {
        $(this).removeClass("open").addClass("closed");
        return $(".style-selector").animate({
          "right": "-240px"
        }, 250);
      } else {
        $(this).removeClass("closed").addClass("open");
        return $(".style-selector").show().animate({
          "right": 0
        }, 250);
      }
    });
});