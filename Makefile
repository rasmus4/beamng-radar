radar.zip : app.js app.json app.png
	mkdir -p build/ui/modules/apps/Radar
	cp app.js build/ui/modules/apps/Radar
	cp app.json build/ui/modules/apps/Radar
	cp app.png build/ui/modules/apps/Radar
	cd build && zip -r radar.zip ui
	rm -r build/ui
