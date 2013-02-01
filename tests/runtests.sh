FAIL=0

#for t in testOC76.js
#for t in testOC86.js
for t in test*
    do
        casperjs test $t
        if [ $? -ne 0 ]
            then
                FAIL=1
        fi
        echo
    done

echo
if [ $FAIL -ne 0 ]
    then
        echo "*** One or more tests failed."
    else
        echo "*** All tests passed."
fi
echo
