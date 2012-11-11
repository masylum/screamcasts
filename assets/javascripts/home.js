$(function(){

  var $body = $('body'),
      gifs = '',
      h = $body.height(),
      w = $body.width(),
      id, last_id,
      i=0;

  var gif_count = ((640 + 60)/175) * Math.ceil(w/175)  +10;

  while (i<gif_count){
    id = Math.floor(Math.random()*14)+1; // the number of gifs goes here
    if (id!== last_id) {
      i++;
      last_id = id;
      gifs += '<img class="bg-gif" src="/images/home-' + id +'.gif"/>';
    }
  }

  $('.hero .gifs').css({
    width: w + 175 + 'px'
  })
  .append(gifs);

});
