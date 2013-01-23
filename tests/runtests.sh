for t in test*
    do
        echo $t
        casperjs test $t
        echo
    done
