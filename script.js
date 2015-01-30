// Matthew Care's hoverzoom

var Hoverzoom = {
    elems: [],
    zoomArea: null,
    divCreated: null,


    ///////////////
    // VARIABLES //
    ///////////////

    // The offset that the zoom div displays under the
    // mouse cursor (in px) use an integer; the 'px' is added
    //  later on since this value is used elsewhere
    divOffsetX: 10,
    divOffsetY: 10,
    // The width and height of the zoom area div in px
    // use an integer; the 'px' is added later on
    // since this value is used elsewhere
    divWidth: 500,
    divHeight: 500,
    // If set to true, the hover area will shift to the left
    // and right of the mouse if the cursor is in the left
    // half, or right half of the screen
    shiftHorizontal: true,
    // If set to true, the hover area will shift above,
    // and below the mouse if the cursor is in the top
    // half, or bottom half of the screen
    shiftVertical: true,
    // Check to see if the source image is
    // smaller than the one on the page
    // True or false
    checkSize: true,
    // If checkSize is true, this value checks
    // the percentage limit that the zoom will
    // occur.
    // Values between 0 and 1
    checkSizeLimiter: 0.5,

    //////////////////////
    // END OF VARIABLES //
    //////////////////////


    // Gets elements to apply hoverzoom to and executes
    // the function to add listeners 
    loaded: function () {
        // Gets all of the elements with the class of hoverzoom.
        // querySelectorAll for IE8 support 
        if (document.getElementsByClassName) {
            Hoverzoom.elems = document.getElementsByClassName('hoverzoom');
        // If IE8
        } else {
            Hoverzoom.elems = document.querySelectorAll('.hoverzoom');
        }
        // If checkSize is set to true, hoverzoom will only apply to
        // images whose source is larger than the element on the page
        if (Hoverzoom.checkSize) {
            Hoverzoom.compareSizes();
        }
        Hoverzoom.checkForElements();
    },

    // Checks there are elements to add listeners to
    checkForElements: function () {
        var elemsLength = Hoverzoom.elems.length,
            i = 0;
        if (elemsLength !== 0) {
            // Loops through elements
            for (i; i < elemsLength; i++) {
                Hoverzoom.addListeners(Hoverzoom.elems[i]);
            }
        }
    },

    // Add listeners to each hoverzoom element
    // attachEvent for IE8 support
    addListeners: function (elem) {
        // IE check
        if (elem.addEventListener) {
            elem.addEventListener('mousemove', function (e) {
                // Creates the zoom area div
                if (!Hoverzoom.divCreated) {
                    Hoverzoom.createZoomArea();
                }
                Hoverzoom.getMousePosition(this, e);
            });
            // Destroys the zoom area div on mouse out
            elem.addEventListener('mouseout', function () {
                Hoverzoom.mouseOut();
            });
        } else {
            elem.attachEvent('onmousemove', function (e) {
                // Creates the zoom area div
                if (!Hoverzoom.divCreated) {
                    Hoverzoom.createZoomArea();
                }
                // Uses e.srcElement in place of the addEventListeners
                // 'this' parameter
                Hoverzoom.getMousePosition(e.srcElement, e);
            });
            // Destroys the zoom area div on mouse out
            elem.attachEvent('onmouseout', function () {
                Hoverzoom.mouseOut();
            });
        }
    },

    // If checkSize is true, this function will compare the original size of
    // the image, against the size displayed. The zoom area will only appear
    // if the displayed image is smaller than the dimension percentage (checkSizeLimiter)
    // of the source image.
    compareSizes: function () {
        var elemsLength = Hoverzoom.elems.length,
            i = 0,
            naturalDimensions,
            naturalWidth,
            naturalHeight,
            tempArray = [];
        // Checks there are elements
        if (elemsLength !== 0) {
            for (i; i < elemsLength; i++) {
                // Gets the natural dimensions of the image
                naturalDimensions = Hoverzoom.getNaturalDimensions(Hoverzoom.elems[i]);
                // Multiplies by the limiter to get the percentage width / height
                naturalWidth = naturalDimensions.width * Hoverzoom.checkSizeLimiter;
                naturalHeight = naturalDimensions.height * Hoverzoom.checkSizeLimiter;
                // Adds to the temp array if criteria are met
                if ((naturalWidth > Hoverzoom.elems[i].width) && (naturalHeight > Hoverzoom.elems[i].height)) {
                    tempArray.push(Hoverzoom.elems[i]);
                }
            }
            // Sets the elems array to the temp array
            Hoverzoom.elems = tempArray;
        }
    },

    // Creates the div for the zoomed content to show in
    createZoomArea: function () {
        Hoverzoom.divCreated = true;
        var div = document.createElement("div");
        div.id = 'zoomArea';
        div.style.width = Hoverzoom.divWidth + 'px';
        div.style.height = Hoverzoom.divHeight + 'px';
        div.style.position = 'absolute';
        div.style.zIndex = '99999';
        document.body.appendChild(div);
        Hoverzoom.zoomArea = document.getElementById('zoomArea');
    },

    // Gets the mouse position
    getMousePosition: function (elem, e) {
        var check,
            zoomArea = Hoverzoom.zoomArea,
            // Gets the zoom area dimensions
            zoomAreaBbox = zoomArea.getBoundingClientRect(),
            // IE8 getBoungingCLientRect returned object doesn't
            // contain width and height, so (bottom - top) and
            // (left - right) are used in place of this
            elemBbox = elem.getBoundingClientRect(),
            // Gets the mouses X and Y position within the
            // image.
            mouseX = e.clientX - elemBbox.left,
            mouseY = e.clientY - elemBbox.top,
            // naturalDimensions isn't supported in IE8 so
            // the getNaturalDimensions function was created
            // to get these instead.
            naturalDimensions = Hoverzoom.getNaturalDimensions(elem),
            // Calculates the magnitude difference between the smaller image
            // and the original image to be used to map the position of the mouse
            // on the smaller image, to the original image.
            widthMultiplier = naturalDimensions.width / (elemBbox.right - elemBbox.left),
            heightMultiplier = naturalDimensions.height / (elemBbox.bottom - elemBbox.top),
            // Gets the X and Y position to apply the background position.
            // Half of the width / height of the zoom area div is added,
            // so that the zoom area is in the center of the zoom div
            // instead of the top left. 0, 0 is the top left corner,
            // and we need 0, 0 to be in the center of the zoom area div
            // Negative values are used so that the background shifts in the correct direction
            positionX = -mouseX * widthMultiplier + ((zoomAreaBbox.right - zoomAreaBbox.left) / 2),
            positionY = -mouseY * heightMultiplier + ((zoomAreaBbox.bottom - zoomAreaBbox.top) / 2);
        Hoverzoom.setDivPosition(e);
        // Checks the position of the mouse so the background always fills
        // the zoom area div
        check = Hoverzoom.checkPosition(positionX, positionY, naturalDimensions.width, naturalDimensions.height);
        // Sets the background image to the same as the image the mouse
        // is hovering over
        Hoverzoom.zoomArea.style.background = 'url(' + elem.src + ') ' + 'no-repeat';
        // Sets the position of the background
        Hoverzoom.zoomArea.style.backgroundPosition =  check.X + ' ' + check.Y;
    },

    // naturalDimensions isn't supported in
    // IE8, so this function works out the
    // hovered image's original (source)
    // dimensions
    getNaturalDimensions: function (elem) {
        var img = new Image();
        img.src = elem.src;
        return {
            width: img.width,
            height: img.height
        };
    },

    // Checks the position of the mouse so that the background always
    // fills the zoom area div.
    checkPosition: function (positionX, positionY, naturalWidth, naturalHeight) {
        var X, Y;

        // Checks the X position of the mouse and sets the X position to either a value,
        // or left or right
        if ((positionX < 0) && (-positionX < naturalWidth - Hoverzoom.divWidth)) {
            X = positionX + 'px';
        } else {
            X = -positionX < 0 ? 'left ' : 'right ';
        }
        // Checks the Y position of the mouse and sets the Y position to either a value,
        // or top or bottom
        if ((positionY < 0) && (-positionY < naturalHeight - Hoverzoom.divHeight)) {
            Y = positionY + 'px';
        } else {
            Y = -positionY < 0 ? 'top' : 'bottom';
        }

        return {
            X: X,
            Y: Y
        };
    },

    // Sets the zoom area div's position on the page
    // Takes into account vertical and horizontal scroll
    // and if the cursor is less than half way across the
    // screen, shifting the div position accordingly
    setDivPosition: function (e) {
        var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        if (e.clientX <= windowWidth / 2 && Hoverzoom.shiftHorizontal) {
            Hoverzoom.zoomArea.style.left = e.clientX + document.body.scrollLeft + Hoverzoom.divOffsetX + 'px';
        } else {
            Hoverzoom.zoomArea.style.left = e.clientX + document.body.scrollLeft - Hoverzoom.divOffsetX - Hoverzoom.divWidth + 'px';
        }
        if (e.clientY <= windowHeight / 2 && Hoverzoom.shiftVertical) {
            Hoverzoom.zoomArea.style.top = e.clientY + document.body.scrollTop + Hoverzoom.divOffsetY + 'px';
        } else {
            Hoverzoom.zoomArea.style.top = e.clientY + document.body.scrollTop - Hoverzoom.divOffsetY - Hoverzoom.divHeight + 'px';
        }
    },

    // Destroys the zoom area div on mouse out
    mouseOut: function () {
        Hoverzoom.zoomArea.style.background = '';
        document.body.removeChild(Hoverzoom.zoomArea);
        Hoverzoom.divCreated = false;
    }
};

// Runs Hoverzoom when the page is loaded
if (window.addEventListener) {
    window.addEventListener('load', function () {
        Hoverzoom.loaded();
    });
// attachEvent for IE8 support
} else {
    window.attachEvent('onload', function () {
        Hoverzoom.loaded();
    });
}