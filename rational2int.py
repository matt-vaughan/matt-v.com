"""
1-to-1 mapping of rational numbers (reals - irrational) to integers.

This mapping follows the following algorithm

rationalToInt(r) = push_primes(r) * 2^d
such that d is the minimum integer where where 10^d * r = z and z is an integer
push_primes(r) takes the prime factors of r and increments them all to the next highest prime

In principle, a unique mapping would exist for an irrational numbers
but you could not determine the required information to produce integer mapping. 
A problem equivalent to Cantor's diagonal.
The variables have seemingly multiple and therefor NO possible values.
Demonstrating the uncountable nature of the set of irrational numbers.

"""

# Previous prime in sequence. example 3 returns 2
def prev_prime(num):
    if num < 3:
        raise "To previous prime"
    n = int(num-1)
    while( num_factors(prime_factors(n)) != 1 ):
        n = n - 1
    return n

# Next prime in sequence. example 2 returns 3, 3 returns 5, etc
def next_prime(num):
    n = int(num+1)
    while( num_factors(prime_factors(n)) != 1 ):
        n = n + 1
    return n

# Increment all primes in factors. example for 10 the factors {2:1, 5:1} become {3:1, 7:1}
def push_prime_factors(factors):
    newfactors = {}
    for prime, exp in factors.items():
        newfactors[next_prime(prime)] = exp
    return newfactors

# Inverse of push_prime_factors, returns a tuple of 2's value and the new list of factors
def pull_prime_factors(factors):
    two = factors.get(2, 0)
    newfactors = {}
    for prime, exp in factors.items():
        if prime != 2:
            newfactors[prev_prime(prime)] = exp
    return two, newfactors

# Number of factors. example: 2*2*3 is 3 factors
def num_factors(factors):
    total = 0
    for prime, exp in factors.items():
        total = total + exp
    return total

# Returns prime factors of a number. Example 60 returns {2:2, 3:1, 5:1}
def prime_factors(n):
    """Returns a list of prime factors of the given integer."""
    factors = {}
    i = 2
    while i * i <= n:
        if n % i:
            i += 1
        else:
            n //= i
            if i in factors:
                factors[i] = factors[i] + 1
            else:
                factors[i] = 1
    if n > 1:
        if n in factors:
            factors[n] = factors[n] + 1
        else:
            factors[n] = 1
    return factors

def factorsToInt(factors):
    result = 1
    for prime, exp in factors.items():
        #print( f"{prime}^{exp} * {result}")
        result = result * prime**exp
    return result 

def rationalToInt( r ):
    if ( r == 0 ):
        return 0

    neg = False
    if ( r < 0 ):
        neg = True

    z = abs(r) # start z 
    d = 0
    while( z % 1 != 0):
        d = d + 1
        z = z * 10
    factors = prime_factors(z)
    
    newfactors = {2: d}

    for prime, exp in push_prime_factors(factors).items():
        newfactors[prime] = exp

    if neg:
        return -factorsToInt(newfactors)
    else:
        return factorsToInt(newfactors)

def intToRational( z ):
    if z == 0:
        return 0

    neg = False
    if z < 0:
        neg = True

    # get the decemial place and factors of the absolute value of z
    # with the prime numbers decremented
    d, factors = pull_prime_factors(prime_factors(abs(z)))
    r = float(factorsToInt(factors))
    while( d > 0 ):
        d = d - 1
        r = r / 10
    
    if neg:
        return -r
    else:
        return r 

# TESTS
passed = True
intvals = []
for i in [x/240 for x in range(0,300,30)]:
    intval = rationalToInt(i)
    if intval not in intvals:
        print(f"Unique mapping of {i} to {intval}")
        intvals.append(i)
    else:
        passed = False
        print(f"Duplicate mapping of {intval} from {i}")
    r = intToRational(intval)
    if r != i:
        print(f"{r} =/= {i}")
        passed = False
    else:
        print(f"{r} = {i}")

if passed:
    print("Passed all tests")
else:
    print("Failed")

intvals = []
for i in [x/5 for x in range(-21,21,3)]:
    intval = rationalToInt(i)
    if intval not in intvals:
        intvals.append(i)
        r = intToRational(intval)
        if r != i:
            print(f"{r} =/= {i}")
            passed = False
        else:
            print(f"Unique mapping of {i}\t to {intval}\tback to {r}")
    else:
        passed = False
        print(f"Duplicate mapping of {intval} from {i}")
    
if passed:
    print("Passed all tests")
else:
    print("Failed")


