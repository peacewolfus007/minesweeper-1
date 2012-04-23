/** 
 * Minesweeper
 * @author: Steve Lindstrom 
 */  
var MineSweeper = function(){

  'use strict';

  /**
    * @var  game
    * @uses Instance of this object for anonymous functions
    */
  var minesweeper = this;

  /**
    * @var  int
    * @uses Indicates the board's size (i.e. 8x8)
    */
  this.boardSize = 8;

  /**
    * @var  array
    * @uses Keeps track of where mines are in the game
    */
  this.board = [];

  /**
    * @var  int
    * @uses indicates how many mines are on the board
    */
  this.mineCount = 4;

  /**
    * Gets the board ready
    */
  this.newGame = function() {

    initializeBoard();
    placeMines();
    buildHtml();

  };

  /**
   * After clicking a tile, this function checks to see if it is a mine;
   * 
   * @param  position int The position of the tile to check
   * @param  isMove boolean True indicates the player moved
   * @return boolean True indicates a mine is there, false otherwise
   */
  this.checkForMines = function(position, isMove) {
    
    if(position < 0 || position >= Math.pow(minesweeper.boardSize, 2)) {
      return;
    }
    
    if(typeof isMove === 'undefined') {
      isMove = true;
    } 
    
    var $tile = $('.tile:eq(' + position + ')'),
       coords = getPosition(position),
            x = coords[0],
            y = coords[1];
    
    // We need to check if this action was caused by a player's move
    // or if it is our code checking adjacent mines.  If it is our
    // code, then we don't want to kill the player if there is a mine 
    // in the position...
    if(isMove && hasMine(x,y)) {
      
      $tile.addClass('mine');
      notify(0);
      
    } 
    // We don't want to check tiles that have already been cleared 
    // or tiles that have flags on them because it will give away 
    // more information than we want it to...
    else if(!$tile.hasClass('cleared') && !$tile.hasClass('flag')){
      
      $tile.addClass('cleared');
      
      var count = 0,     // The number of adjacent mines
          toCheck = [];  // Other tiles we need to check
      
      // top center
      if(hasMine(x,y-1)) {
       count++; 
      } else if(isMove){
       toCheck.push([x,y-1]);
      }
      
      // bottom center
      if(hasMine(x,y+1)) {
       count++;
      } else if(isMove){
       toCheck.push([x,y+1]);
      }
      
      // Since the tiles are all floated to the left, we need to make sure 
      // that we don't check tiles on the opposite side of the board.
      // i.e. a tile at position [0,7] should not reveal a tile at [1,0]
      if(x + 1 < minesweeper.boardSize) {
        
        // right
        if(hasMine(x+1,y)) {
          count++;
        } else if(isMove){
          toCheck.push([x+1,y]);
        }

        // top right
        if(hasMine(x+1,y-1)) {
          count++;
        } else if(isMove){
          toCheck.push([x+1,y-1]);
        }
        
        // bottom right
        if(hasMine(x+1,y+1)) {
          count++; 
        } else if(isMove){
          toCheck.push([x+1,y-1]);
        }
      }
      
      // Again, we want to make sure that tiles on opposite ends do not reveal 
      // each other...
      if(x - 1 >= 0) {
        
        // left
        if(hasMine(x-1,y)) {
         count++; 
        } else if(isMove){
          toCheck.push([x-1,y]);
        }

        // top left
        if(hasMine(x-1,y-1)) {
          count++; 
        } else if(isMove){
          toCheck.push([x-1,y-1]);
        }

        // bottom left
        if(hasMine(x-1,y+1)) {
          count++; 
        } else if(isMove){
          toCheck.push([x-1,y+1]);
        }
      }
         
      // Mark the number of adjacent tiles...
      if(count > 0) {
        $tile.html(count);
      } 
            
      // If there are adjacent tiles that do not have mines, 
      // we need to loop through them and potentially clear them...
      for(var i = 0; i < toCheck.length; i++) {
        coords = toCheck[i];
        position = coords[1] * minesweeper.boardSize + coords[0];

        minesweeper.checkForMines(position, false);
      }
      
      // After all of the moves, check to see if we uncovered every tile 
      // that does *not* contain a mine...
      minesweeper.checkForWin();
    }
  };
  
  /**
   * Checks to see if the user has beaten the game.
   * A game is won when all tiles are cleared except for mines.
   * If there are flags on mineless tiles, the user also needs to clear them.
   */
  this.checkForWin = function() {
    if(Math.pow(this.boardSize, 2) - $('.cleared').length === this.mineCount){
      notify(1);
    }
  };

  /**
   * Plants or removes a flag on a particular tile.
   * 
   * @param position int The tile to toggle a flag for
   */
  this.toggleFlag = function(position) {
    var $tile = $('.tile:eq(' + position + ')');
    
    if($tile.hasClass('flag')) {
      $tile.removeClass('flag');
    } else {
      $tile.addClass('flag');
    }    
  };


  //
  // Private methods:
  //

 /**
  * Builds the board on the screen
  */
  var buildHtml = function() {

    $('#board').remove();

    var $board = $('<div/>', {
      'id'    : 'board',
      'class' : 'minesweeper',
      'width'  : minesweeper.boardSize * 50 + 'px',
      'height' : minesweeper.boardSize * 50 + 'px'
    });

    for(var i = Math.pow(minesweeper.boardSize, 2) - 1; i >= 0 ; i--) {
      $('<div/>', {
        'class' : 'tile'
      }).appendTo($board);
    }
    
    var $newGame = $('<a/>', {
      href : document.location,
      text : 'New Game',
      id   : 'new'
    });

    $board.appendTo('body');
    $newGame.appendTo('body');
  };

  /**
   * Returns the coordinates of a given tile.
   * 
   * @param  int position The position of the tile in question
   * @return array Contains the x and y coordinate of the tile
   */
  var getPosition = function(position) {
    var y = Math.floor(position / minesweeper.boardSize);
    var x = Math.abs((y * minesweeper.boardSize) - position);
    
    return [x,y];
  };

  /**
    * Gets the board ready for mine placement
    */
  var initializeBoard = function() {

    $('#board').remove();
    minesweeper.board = [];
    

    for(var i = minesweeper.boardSize -1 ; i >= 0; i--) {

      var row = [];

      for (var j = minesweeper.boardSize - 1; j >= 0 ; j--) {
        row.push(false);
      }

      minesweeper.board.push(row);
    }
  };

  /**
    * Places mines on the board.
    * 
    * @return int The number of mines placed
    */
  var placeMines = function() {

    var minesPlaced = 0;

    while(minesPlaced < minesweeper.mineCount) {

      var x = Math.floor(Math.random() * minesweeper.boardSize);
      var y = Math.floor(Math.random() * minesweeper.boardSize);

      if(!minesweeper.board[x][y]) {
        minesweeper.board[x][y] = true;
        ++minesPlaced;
      }
    }
  };
  
  /**
   * Checks to see if there is a mine at position [x,y]
   * 
   * @param x int X coordinate to check
   * @param y int Y coordinate to check
   * @return boolean True indicates there is a mine, false otherwise
   */
  var hasMine = function(x,y) {
    
    var hasMine = false;
    
    // Note: These conditionals were broken up for aesthetics...
    if(x >= 0 && y >= 0) {
      if(x < minesweeper.boardSize && y < minesweeper.boardSize) {
        hasMine = minesweeper.board[x][y]; 
      }
    } 
    
    return hasMine;
  };
  
  /**
   * Notifies the user when they have won or lost the game.
   * 
   * @param status int 0 indicates losing the game, 1 indicates a win.
   */
  var notify = function(status) {

    var $msg = $('<div/>');

    if(status) {
      $msg.addClass('success').html('<h1>You Win!</h1>');
    } else {
      $msg.addClass('failure').html('<h1>You Lose!</h1>');
    }
    
    $msg.prependTo('body').animate({
      height : '100px'
    });
  };
  
  //
  // Begin bindings
  //
  
  /**
   * Bind 'left click' on tiles to clear a tile.
   */
  $('body').on('click', '.tile', function(e){
    
    e.preventDefault();
    
    if(!$(this).hasClass('.cleared')){
     minesweeper.checkForMines($(this).index());  
    }        
  });
  
  /**
   * Bind 'click' on the "New Game" button to redraw the board and 
   * generate a new tile placement.
   */
  $('#board').on('click', '#new', function(){
    this.newGame();
  });
  
  /**
   * Bind 'right click' on tiles to toggle the placement of a flag
   */
  $('body').on('contextmenu', '.tile', function (e){
    e.preventDefault();
    minesweeper.toggleFlag($(this).index());
  });

};
    
    
var minesweeper = new MineSweeper();
    minesweeper.newGame();