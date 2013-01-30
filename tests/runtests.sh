for t in test*
    do
        casperjs test $t
        echo
    done
