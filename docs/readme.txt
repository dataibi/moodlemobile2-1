How do I have to create the content in Moodle?

[Maps & Rooms]

Maps and Rooms have to be in the announcements part. Maps and rooms are new pages.
Images and descriptions for Maps and rooms are in the content area of the page.

The content order for maps and rooms is like this:

1. Image (with or without hotpot description)
2. The ordered list of all rooms (if it`s a map) or exhibits (if it`s a room) with the coordinates (if you want hotspots)

    with hotspots:
        1. statue one (x-value:25, y-value:15, number: 1): https://moodle.mathetics.eu/course/view.php?id=29#section-1
        2. statue two (x-value:20, y-value:50, number: 2): https://moodle.mathetics.eu/course/view.php?id=29#section-2
        3. statue three (x-value:100, y-value:100: number: 3): https://moodle.mathetics.eu/course/view.php?id=29#section-3

    without hotspots:
        1. Room one: https://moodle.mathetics.eu/mod/page/view.php?id=703
        2. Room two: https://moodle.mathetics.eu/mod/page/view.php?id=704
        3. Room three: https://moodle.mathetics.eu/mod/page/view.php?id=705

It`s very important to do it exactly like the example. Please use ordered list and not unordered. and don`t forget space after : .

3. Short description for the content (mark the text and use the "Heading (small)" format for it)
4. Long description (mark the text and use the paragraph format for it)


It is possible to use hotspots in maps and rooms. You can decide for every map or room whether you want it or not.
If you want to use hotspots, you must fill in the word "hotspotimage" under "Describe this image for someone who cannot see it" in the Image-mask. And then use the coordinates in the list described above.
x-value is percent from the left in the image and y-value is percent from the top of the image.

If you have maps in the project:

Every maps title has to begin with "{"map":1} " without the outer ". Number is for the map number.
Every room has to begin with: "{"map":1,"room":2} " without the outer ".


If you don`t have one or more maps the room titles begin with "{"room":1} " without the outer ".
Every exhibit has to have in the summary part at first this: "{"room":1,"exponat":1}" without the outer ".


[Exhibits]

Every exhibit is a new topic.

If you have maps in the project:
Every exhibit has to have in the summary part at first this: "{"map":1,"room":1,"exponat":1}" without the outer ".

If you don`t have one or more maps:
Every exhibit has to have in the summary part at first this: "{"room":1,"exponat":1}" without the outer ".

!!! The first exhibit in a room is always "exponat: 1". The secons one is "exponat: 2" etc. It is not the same number as in "numbers" for the Hotspots in the Room or Map description. !!!

The content order is (use a new line for every part):

Section name: title of the exhibit

In Summary:
1. The json string like this {"map":1,"room":2,"exponat":1} described above
2. Short description for the content (mark the text and use the "Heading (small)" format for it)
3. Long description (mark the text and use the paragraph format for it)
4. the image (no hotspots allowed)

