##---------------------------------------------------------------##
##
## Jeb Rosen - Jan 2019
##
##---------------------------------------------------------------##

## Our project name
PROJ = Dfam
WEB_DIR = /usr/local/Dfam

DIRS = 

all:

#
# Update the live site
#
#deploy: build-prod
#	rm -rf $(WEB_DIR)
#	mkdir $(WEB_DIR)
#	cp -R dist/Dfam/* $(WEB_DIR)

build-prod:
	ng build --prod

lint:
	ng lint

revert:
	for X in $(HTML) ; do \
          mv $$X.bak $$X ; \
          done

clean:
	-rm *~ *.bak
	-for X in $(DIRS) ; do \
          rm $$X/*~ $$X/*.bak ; \
          done
