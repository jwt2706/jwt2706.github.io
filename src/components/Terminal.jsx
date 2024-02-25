import React, { useState, useEffect } from "react";
import "../assets/styles/terminal.scss";

const commands = [
  "ls",
  "cd projects",
  "ls",
  "",
  // Add more commands here
];

function Terminal() {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentCommand, setCurrentCommand] = useState("");

  useEffect(() => {
    let commandInterval;
    let typingInterval;

    typingInterval = setInterval(() => {
      if (currentCommand.length < commands[currentCommandIndex].length) {
        setCurrentCommand(
          commands[currentCommandIndex].substr(0, currentCommand.length + 1)
        );
      } else {
        clearInterval(typingInterval);

        commandInterval = setInterval(() => {
          setCurrentCommandIndex((prevIndex) => {
            const newIndex = prevIndex + 1;
            if (newIndex < commands.length) {
              setCurrentCommand("");
              return newIndex;
            } else {
              clearInterval(commandInterval);
              return prevIndex;
            }
          });
        }, 1000);
      }
    }, 100); // Type each letter every 100ms

    return () => {
      clearInterval(typingInterval);
      clearInterval(commandInterval);
    }; // Clean up on unmount
  }, [currentCommand, currentCommandIndex]);

  return (
    <div className="terminal">
      <div className="input">
        <span className="prompt">root@jwt2706.ca:~$ </span>
        <span className="command">
          {currentCommand.length < commands[currentCommandIndex].length
            ? currentCommand + "_"
            : currentCommand}
        </span>
      </div>
    </div>
  );
}

export default Terminal;