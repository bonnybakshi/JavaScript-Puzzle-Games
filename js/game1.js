
window.addEventListener("load", startGame);

function startGame(){
    // variable to store blank tile's row and column index
    var blankRow;
    var blankCol;
    
    // variable to store number of shuffles
    var shuffleNum = 100;
    
    // board element
    var cardBoard = document.getElementById("cardBoard");
   
    // length of rows 
    var rowLength = cardBoard.children.length;
    // reset game before it begins
    resetGame(); 
    
    /*############# TimerKeeper Object #################*/
    /* this object is used for calculating players 
     * time in the game. 
     */
    var TimerKeeper = function(){
        // Property
        this.interval = 1000;
        this.timeHolderElement;
        this.sec;
        this.min;
        this.myTimer;
        this.currentElement;
        this.bestElement;
        this.bestMin = 60;
        this.stopAlert;

        // Private variable: Hold instance of this class
        var thisObject;

        /**
         *  This method sets the game Timer 
         */ 
        this.gameTimer = function(){
            
            thisObject = this;
            
            this.myTimer = setInterval(function(){
                thisObject.timeHolderElement.innerHTML = thisObject.min + " : " + thisObject.sec;
                thisObject.sec++; 
                if(thisObject.sec >= 60)
                {
                    thisObject.sec = 1;
                    thisObject.min++;
                }else if(thisObject.min > 30){
                    clearInterval(thisObject.myTimer);
                    thisObject.stopAlert();
                }
            }, thisObject.interval);
        }
        /**
         *  This method resets the game timer 
         */
        this.resetTimer = function(){
            this.timeHolderElement.innerHTML = "0 : 0";
            clearInterval(this.myTimer);
            this.sec = 0;
            this.min = 0;
        }
        /**
         *  This method calculates the minimum time taken by the player 
         *  and displays it as the best time
         */
        this.bestTime = function(){
            this.sec = this.sec - 1;
            // total min taken by the player 
            var totalmin = this.min + (this.sec / 60);
            if(totalmin < this.bestMin)
            {
                this.bestMin = totalmin;
                // display best time
                this.bestElement.innerHTML = this.min + " : " + this.sec;
            }
        }
    }
    /*############# End of TimerKeeper Object #################*/
    
    /******* An instance of TimerKeeper object **********/
    var newTimer = new TimerKeeper();

    // get elements from document to keep time
    newTimer.timeHolderElement = document.getElementById("time");
    newTimer.currentElement = document.getElementById("current");
    newTimer.bestElement = document.getElementById("best");

    // set method for stopAlert
    newTimer.stopAlert = function(){    
        alert("Oops!! TIME OUT!! \n Try Again");
        // click end game button 
        document.getElementById("end").click();
    }

    // reset the timer before game begins
    newTimer.resetTimer();
    

    /*############# Events #################*/
    /* This event will be triggered if "Shuffle" button is clicked
     * If shuffle button is clicked - 
     * 1.reset timer
     * 2.shuffle tiles
     * 3.disable shuffle button
     * 4.start game timer
     */
    var shuffleBtn = document.getElementById("shuffle");
    shuffleBtn.addEventListener("click", function( event ) { 
        newTimer.resetTimer(); 
        shuffle();
        shuffleBtn.disabled = true;
        newTimer.gameTimer();
    });

    /* This event will be triggered if "End Game" button is clicked
     * If end game button is clicked - 
     * 1.clear class
     * 2.reset game
     * 3.reset game timer
     * 4.enable shuffle button
     */
    var end = document.getElementById("end");
    end.addEventListener("click", function( event ) { 
        clearClass();
        resetGame();
        newTimer.resetTimer();
        shuffleBtn.disabled = false;
    });


    /* This event will be triggered when each tile is clicked*/
    cardBoard.addEventListener("click", function( event ) { 
        // if a tile is clicked which is not a blank tile  
        if(event.target != event.currentTarget && event.target.innerHTML != " " ){
            
            //variable to store selected tile's row and column index
            var btnRow;
            var btnCol;
            
            // get selected tile's inner HTML
            selectedTile = event.target.innerHTML 
            
            // get blank tiles row and column index       
            getBlankRowColIndex();
            // loop through tiles and get selected tile's row and column index
            for (var row = 0; row < rowLength; row++){
                var colLength = cardBoard.children[row].children.length;
                for (var col = 0; col < colLength; col++){ 
                    if(cardBoard.children[row].children[col].innerHTML == selectedTile )
                    {
                        btnRow = row;
                        btnCol = col;
                    }    
                }
            }
               
            // loop through all tiles 
            for (var row = 0; row < rowLength; row++) {
                var colLength = cardBoard.children[row].children.length;
                for (var col = 0; col < colLength; col++)
                { 
                    // if shifting is possible, swap selected tile with blank
                    if (shiftingisPossible(btnRow, btnCol)){
                        var selected = cardBoard.children[btnRow].children[btnCol];
                        selected.innerHTML = " "
                        selected.classList.remove("card");
                        selected.className += ' blank';
                    

                        var blankswap = cardBoard.children[blankRow].children[blankCol];
                        blankswap.innerHTML = selectedTile;
                        blankswap.classList.remove("blank");
                        blankswap.className += ' card';     
                    }     
                }
            }
            // check for win after every move
            checkForWin();      
        }
    }, false);

    /*############# End of Events#################*/

    /*############# Functions #################*/
    /**
     *  This function loop through all rows and columns and resets 
     *  the board to its original position
     */
    function resetGame(){
        var tileText = 1;
        for (var row = 0; row < rowLength; row++){
            var colLength = cardBoard.children[row].children.length;
            for(var col = 0; col < colLength; col++){
                if(row == rowLength - 1 && col == colLength -1){
                    cardBoard.children[row].children[col].className += ' blank';
                } else{
                    cardBoard.children[row].children[col].className += ' card';
                }
                cardBoard.children[row].children[col].innerHTML = tileText; 
                tileText++;
            }  
        }
    }
    /**
     *  This function loops through all rows and columns to clear classes  
     *  of all tiles
     */
    function clearClass(){
        for (var row = 0; row < rowLength; row++){
            var colLength = cardBoard.children[row].children.length;
            for(var col = 0; col < colLength; col++){
                if(cardBoard.children[row].children[col].classList.contains("blank")){
                    cardBoard.children[row].children[col].classList.remove("blank");
                }else if(cardBoard.children[row].children[col].classList.contains("card")){
                    cardBoard.children[row].children[col].classList.remove("card");
                } 
            }  
        }
    }

    /**
     *  This function determines a win by looping through all rows and columns  
     *  to check if the numbers are sorted, bringing the puzzzle board to its
     *  original position. 
     *
     *  @return a boolean value for win
     */ 
    function checkForWin(){
        var num = 1; // number on the tile 
        for (var row = 0; row < rowLength ; row++) {
            var colLength = cardBoard.children[row].children.length;
            for (var col = 0; col < colLength; col++){ 
                if(!(row == 3 && col == 3)){
                    if(cardBoard.children[row].children[col].innerHTML != num){
                        return false;
                    } else{
                        num++;
                    }  
                } 
            }
        }
        /* if true - 
        display win message
        enable shuffle button
        reset timer and display current time and best time */
        alert("CONGRATULATIONS!! YOU WON!!!");
        shuffleBtn.disabled = false;
        newTimer.currentElement.innerHTML = newTimer.timeHolderElement.innerHTML;
        newTimer.bestTime(); 
        newTimer.resetTimer(); 
        return true;
    }

    /**
     *  This function loops through all rows and columns  
     *  to get the blank tile's position 
     *
     */ 
    function getBlankRowColIndex(){
        for (var row = 0; row < rowLength; row++){
            var colLength = cardBoard.children[row].children.length;
            for(var col = 0; col < colLength; col++){
                
                if(cardBoard.children[row].children[col].classList.contains("blank")){
                    blankRow = row;
                    blankCol = col;
                    
                }    
            }  
        }
    }

    /**
     *  This function determines if a particular tile can 
     *  be shifted on the board by comparing it with the blank
     *  tile's position
     *
     *  @param row  selected row
     *  @param column  selected column
     *  @return a boolean value to determine if a tile can be shifted
     */ 
    function shiftingisPossible (row, column){
        var columnDiff = blankCol - column;
        var rowDiff = blankRow - row;

        if ((columnDiff + rowDiff != 0) && (columnDiff != rowDiff)
            && (columnDiff <= 1) && (columnDiff >= -1) 
            && (rowDiff <= 1) && (rowDiff >= -1))
            return true;
        else return false; 
    }

    /**
     *  This function shuffles the tiles
     *  It stores the location of all tiles next to the blank 
     *  tile and then randomly selects one of them to swap it 
     *  with the blank one. It repeats this process till all
     *  tiles on the board gets shuffled.
     *
     */ 
    function shuffle(){
        // Array to store posible move's rows and columns 
        var listRow ;
        var listCol ;
        
        // shuffle loop
        for(var i = 0; i <= shuffleNum; i++) {
            // clear the array before every shuffle
            listRow = [];
            listCol = [];
            
            // iterate over all tiles to find the posible move
            for (var row = 0; row < rowLength; row++){
                var colLength = cardBoard.children[row].children.length;
                for(var col = 0; col < colLength; col++)
                {
                    // get row and column for blank tile 
                    getBlankRowColIndex();
                    /* get list of row and col for tiles that are
                     directly up, down, left, right from blank tile
                     and store it in the array */ 
                    if (shiftingisPossible(row, col))
                    {
                        listRow.push(row);
                        listCol.push(col);    
                    }       
                }
            }
          
            //Randomly select the row index from the array of rows
            var rand = getRandom(0, listRow.length -1);
           
            // swap the selected button with blank tile
            var temp = cardBoard.children[listRow[rand]].children[listCol[rand]];
            var tempVal = temp.innerHTML;
            temp.innerHTML = "";
            temp.classList.remove("card");
            temp.className += ' blank';
           
            var blankBtn = cardBoard.children[blankRow].children[blankCol]
            blankBtn.innerHTML = tempVal;
            blankBtn.classList.remove("blank");
            blankBtn.className += ' card';
        }   
    }

    /**
     *  This function selects a random number between a specified range 
     *
     *  @param  min   min range
     *  @param  max   max range
     *  @return a random value between min and max
     */ 
    function getRandom( min, max) 
    {
        var range = (max - min) + 1;
        return Math.floor(Math.random() * range) + min;
    }
}//end of start game function

  