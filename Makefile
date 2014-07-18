BIN:=$(shell npm bin)

all: build/episode.html

build/rl.html: resources.yaml
	mkdir -p build
	$(BIN)/realist < resources.yaml > build/rl.html

build/episode.html: build/rl.html episode.md layout.html
	./make.js > build/episode.html

clean:
	rm -rf build
