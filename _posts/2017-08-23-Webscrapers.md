---
layout: post
title: "Webscrapers: API first, then UI"
categories: [code, python]
tags: [redwall, python, reddit]
---

### API Before UI: A Webscraping Story

I've spent countless hours sifting through [/r/wallpaperdump](http://reddit.com/r/wallpaperdump) for just the right wallpapers, downloading one in a thousand to my Wallpapers directory, and setting that desktop background to rotate through that directory.  When my roommates started pointing out how often I was browsing wallpapers, I decided to make a project out of it: [Redwall](http://github.com/brettjsettle/redwall).  While plenty of web scrapers already exist, my goal was to simplify the transition from internet file to desktop background.  As with any project, there were plenty of lessons along the way:

##### Open Source
A simple search led me to [RedditImageGrabber](https://github.com/HoverHell/RedditImageGrab/tree/master/redditdownload) as an API to fetch post and image urls. Merged with the wallpaper setting function from [this StackOverflow post](https://stackoverflow.com/questions/1977694/how-can-i-change-my-desktop-background-with-python) to update your wallpaper in real time,  most of the work was done for me. All I had to do was wrap these two files into one module and BOOM! Easy. All that remained was designing the interface. Better look at some examples...

##### Everything Exists Already
Most image scrapers provide some basic filter options and show results asa giant mesh. If you click on an image it zooms in. All that jazz. But I just wanted a fullscreen image stepper that I could control with arrow keys, which somehow didn't seem to exist. Until I stumbled on [imagoid](http://imagoid.com).  A reddit image scraper for more than just wallpapers that offers fullscreen iteration with arrow keys, and it's a webapp. (It's seriously cool, check it out) Although I was discouraged, this project really interested me and I wanted to add my own twist.

##### Straight to UI (aka where I went wrong)
My day job made heavy use of [PyQt](https://riverbankcomputing.com/software/pyqt/intro) to build windowed image analysis applications for researchers in the lab, and I loved the SDK so much I was using it everywhere. Even places it didn't belong.  So I started designing the layout in PyQt while working on the merging the backend code.  Which reinforced the age old lesson:
> *Never design your API around your user interface.*


Fortunately I was motivated enough to get a pretty neat result, so it all seemed worth it. I had all the functionality of a basic scraper, with background caching of images for nearly seamless scrolling.
![Initial Result]({{ site.baseurl }}/images/redwall_windowed_snap.PNG)
But I was having a lot of issues with the image scraping thread fighting the GUI thread for CPU.  I needed a simpler interface. Which also meant going back and cleaning up the API.  If you are interest in the windowed version, [the repo branch](https://github.com/BrettJSettle/RedWall/tree/windowed) is still available.

##### Simple and reliable
I stripped away all requirements other than BeautifulSoup, turned the image scraping into a Python iterator class, and wrote two wrappers for ease of use. Both are available via pip entry_points:
```bash
# Images are shown on the desktop for 8 seconds (or whatever time specified by -i)
redwall_screensaver

# A command line interface to iterate through images manually, with a help menu.
redwall_control
```
Now I can run `python_screensaver -i 20 --subreddit wallpaperdump` and watch reddit wallpapers scroll by at an even pace while I'm at work.  Needless to say, after this project I was MUCH less interested in browsing wallpapers.

For more documentation and use cases of redwall, check out [the Github](http://github.com/brettjsettle/redwall)
