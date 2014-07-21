BIN:=$(shell npm bin)

all: build/episode.html

build/episode.html: resources.yaml episode.md layout.html
	mkdir -p build
	./make.js > build/episode.html

clean:
	rm -rf build
