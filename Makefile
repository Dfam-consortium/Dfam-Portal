##
##
## Robert Hubley - Oct 2018
##
##
##---------------------------------------------------------------##
## Our project name
PROJ = Dfam
WEB_DIR = /usr/local/Dfam
DEV_DIR = /usr/local/Dfam_dev

DIRS = app app/layout app/overview  app/public  \
       app/rmlib  app/services  app/upload \
       assets/css  assets/download assets/images 

HTML := $(shell find app/ -name '*.html') index.html

JS := $(shell find app/ -name '*.js')

all: refresh 

##
## Update the dev site
##
install:
	perl -i -pe 's/:10010/:10011/g;' app/app.js
	rm -rf $(DEV_DIR)
	mkdir $(DEV_DIR)
	cp -R * $(DEV_DIR)

refresh:
	perl -i -pe 's/:10010/:10011/g;' app/app.js
	cp index.html $(DEV_DIR)
	cp -R app $(DEV_DIR)
	

##
## Update the live site
##
deploy:
	perl -i -pe 's/:10011/:10010/g;' app/app.js
	rm -rf $(WEB_DIR)
	mkdir $(WEB_DIR)
	cp -R * $(WEB_DIR)

#tidy -xml -indent foo.html
tidy:
	for X in $(HTML) ; do \
          cp $$X $$X.bak ; \
          js-beautify -r --type html $$X; \
          done
	for X in $(JS) ; do \
          cp $$X $$X.bak ; \
          js-beautify -r --type js $$X; \
          done

revert:
	for X in $(HTML) ; do \
          mv $$X.bak $$X ; \
          done

clean:
	-rm *~ *.bak
	-for X in $(DIRS) ; do \
          rm $$X/*~ $$X/*.bak ; \
          done



