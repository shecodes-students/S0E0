BIN:=$(shell npm bin)

all: build/episode.html

build/episode.html: resources.yaml episode.md layout.html
	mkdir -p build
	./make.js > build/index.html

clean:
	rm -rf build

publish:
	mkdir -p publish
	git clone git@github.com:shecodes-students/shecodes-students.github.io.git publish

upload: all publish	
	cd publish && git pull --rebase
	mkdir -p publish/beta/S0E0
	cp -r build/* publish/beta/S0E0
	cp -r foundation publish/beta
	cp episode.css publish/beta
