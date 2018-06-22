
exports.syncLoop = (iterations, process, exit) => {
  let index = 0, done = false, shouldExit = false;
  let loop = {
    next: function () {
      if (done) {
        if (shouldExit && exit) {
          exit(); // Exit if we're done
        }
        return; // Stop the loop if we're done
      }
      // If we're not finished
      if (index < iterations) {
        index++; // Increment our index
        if (index % 100 === 0) {
          // clear stack
          setTimeout(function () {
            process(loop); // Run our process, pass in the loop
          }, 1);
        } else {
          process(loop); // Run our process, pass in the loop
        }
        // Otherwise we're done
      } else {
        done = true; // Make sure we say we're done
        if (exit) exit(); // Call the callback on exit
      }
    },
    iteration: function () {
      return index - 1 // Return the loop number we're on
    },
    break: function (end) {
      done = true; // End the loop
      shouldExit = end; // Passing end as true means we still call the exit callback
    }
  }
  loop.next();
  return loop;
};
