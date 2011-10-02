test: rtkeyboardshortcuts.user.js
	java -jar /home/jenkins/addons/lib/jslint4java.jar --report xml rtkeyboardshortcuts.user.js > rtkeyboardshortcuts.user.js.jslint.out
hudson-test: rtkeyboardshortcuts.user.js
	java -jar /home/jenkins/addons/lib/jslint4java.jar --report xml rtkeyboardshortcuts.user.js > rtkeyboardshortcuts.user.js.jslint.out || exit 0
clean: 
	rm -f *.out
