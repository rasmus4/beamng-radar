radar.zip : app.js app.json app.png radar.lua modScript.lua
	mkdir -p build/ui/modules/apps/radar
	cp app.js build/ui/modules/apps/radar
	cp app.json build/ui/modules/apps/radar
	cp app.png build/ui/modules/apps/radar
	mkdir -p build/lua/ge/extensions
	mkdir -p build/scripts/radar
	cp radar.lua build/lua/ge/extensions
	cp modScript.lua build/scripts/radar
	cd build && zip -r radar.zip ui scripts lua
	rm -r build/ui
	rm -r build/scripts
	rm -r build/lua
