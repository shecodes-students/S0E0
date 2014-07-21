BIN:=$(shell npm bin)

all: build/episode.html

build/episode.html: episode.md layout.html
	./make.js > build/episode.html

clean:
	rm -rf build
