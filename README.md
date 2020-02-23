# Realtime Collaborative Image Editor

## Team Members

Winston Zhu zhurene 1002515209

Leo Chan chanleo8 1003338435

Wayne Wang wangy337 1002241674

## Description

Web based image editor that automatically updates between multiple users. 

(Paint + Layers) x People

## Beta Features

- Real Time Updates, changes made to the server should be reflected in the user’s client.

- Real Time Collaboration, multiple users can edit the same document at the same time.

- Draw Lines and Squares, simple functionality for drawing on the document’s canvas.

- Simple User Interface, simple enough to show the functions in Beta version.

- Link to Share Documents, an easy way to share document with just a link.

## Final Features

- Modify Properties, give different properties to tools such as change colours, crop, filters, etc.

- Add More Shapes, more tools for editing the document.

- Add Multiple Layers in a Tree Structure, adding layers to the document for more flexible editing.

- Upload Image from file system or URL, adding a picture to the document.

- Aesthetic and Accessible User Interface, develop the user interface more.

- Secure Link to access the image, add more security and permission to share the documents.

- Export Documents, save the document as image files to user’s computer or share as an image link.

## Technologies

- Canvas: A node js library that provides basic drawing tools. Allows the user to create a canvas instance and draw lines, shapes, etc. in the web browser.

- Socket.io: node js api that enables real-time, bidirectional and event-based communication.

- Some API’s to help with improving the User Interface.

## Technical Challenges

- Real Time Updates, make sure that the server and clients know when a change is made and is updated accordingly.

- Multiple Users Synchronization, when a change is made which ones to keep and which to discard or overwrite.

- Implementing multiple layers, each layer needs to be stored as a data structure in the server.

- Clipboard Management, how to store the pictures and pixels in the clipboard and how to apply them to the layers.

- Exporting features, how to get the link to be accessible and how to save the images in different formats.
