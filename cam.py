# Matthew Vaughan
# Makes 'diamond art' from a webcam
import cv2
import numpy as np

TOLERANCE = 16  # Red, blue, green tolerance  (within 0 - TOLERANCE is viewed as the same color)
SIZE = 6        # SIZE (pixels) * SIZE (pixels) = SquareSize (squarepixels)

# Open the default camera
cam = cv2.VideoCapture(0)

# Get the default frame width and height
frame_width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Define the codec and create VideoWriter object
# fourcc = cv2.VideoWriter_fourcc(*'mp4v')
# out = cv2.VideoWriter('output.mp4', fourcc, 20.0, (frame_width, frame_height))

# a single color in BGR (as string displays in RGB)
class Color:
    def __init__(self, blue, green, red):
        self.blue = blue
        self.green = green
        self.red = red
    
    def __str__(self):
        return f"({self.red},{self.green},{self.blue})"
    
    def __eq__(self, other):
        if self.blue == other.blue and self.green == other.green and self.red == other.red:
            return True
        else:
            return False
    
    def bgr(self):
        return [self.blue, self.green, self.red]

class Colors:
    def __init__(self, tolerance):
        self.colors = []
        self.tolerance = tolerance
    
    def __add__(self,other):
        if type(other) == [int]:
            other = Color(
                (other[0]//self.tolerance)*self.tolerance,
                (other[1]//self.tolerance)*self.tolerance,
                (other[2]//self.tolerance)*self.tolerance)
        elif type(other) == Color:
            other = Color(
                (other.blue//self.tolerance)*self.tolerance,
                (other.green//self.tolerance)*self.tolerance,
                (other.red//self.tolerance)*self.tolerance)
        else:
            print("This is an error")
        
        if other not in self.colors:
            self.colors.append(other)

        return other

    def __len__(self):
        return len(self.colors)
    

def average(frame, x, y, length):
    colors = Colors(TOLERANCE)

    blue = np.int64(0)
    green = np.int64(0)
    red = np.int64(0)
    for i in range(x, x+length):
        for j in range(y, y+length):
            blue  += frame[i][j][0]
            green += frame[i][j][1]
            red   += frame[i][j][2]

    # write over pixels in a SIZE*SIZE square with the color average (within the tolerance)
    for i in range(x, x+length):
        for j in range(y, y+length):
            # add color (if unique) to current colors
            average = colors + Color(blue // (length*length), green // (length*length),red // (length*length))
            frame[i][j][0:3] = average.bgr()    

    # draw plus in center of dot square
    for i in range(length//2):
        frame[x+i][(y+y+length)//2][0:3] = Color(0,0,0).bgr()
        frame[(x+x+length)//2][y+i][0:3] = Color(0,0,0).bgr()

    # print(f"Number of colors in frame: {len(colors)}")
    return frame


def dotify(frame, length):
    for i in range(len(frame) // length):
        for j in range(len(frame[0]) // length):
            frame = average(frame, i*length, j*length, length)
    return frame

while True:
    ret, frame = cam.read()

    newFrame = dotify(frame, SIZE)

    # Write the frame to the output file
    # out.write(frame)

    # Display the captured frame
    cv2.imshow('Camera', newFrame)

    # Press 'q' to exit the loop
    if cv2.waitKey(1) == ord('q'):
        break

# Release the capture and writer objects
cam.release()
# out.release()
cv2.destroyAllWindows()