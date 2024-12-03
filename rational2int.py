"""
1-to-1 mapping of *finite length* binary strings to natural numbers

But this will work for any binary strings of an arbitrary finite length
and the mapping remains consistent and 1-to-1 as n (the length of the strings) 
increase

Run the code :)
"""

# Previous prime in sequence. example 3 returns 2, 11 returns 7, etc
def prev_prime(num):
    if num <= 2:
        raise "no previous prime"
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

"""
All the magic is in push and pull prime factors
example:
input to push_prime_factors = {2:2, 3:1, 5:1} -- presumably for 60
output would be             = {3:2, 5:1, 7:1} -- removes the 2, reserving it to encode number of leading zeros or decimal place

pull_prime_factors just reverses the process, returning the new set of factors and the previous value for '2' in a tuple
input   {2:1, 3:2, 5:3, 7:4}
output  1, {2:2, 3:3, 5:4}
"""
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

"""
Mapping of all non irrational reals (rational numbers) to ints and back
"""
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

"""
The best part... this is an 'effective' (psuedo) 1-to-1 mapping of
binary strings to natural numbers for all binary strings of an arbitrary length...

How is that the case that this works if binary strings are uncountable?
BECAUSE our real world input is finite, we can deal with two dimensions of counting

The reason we can't get irrational numbers mapped is their infinite length...
We could only map their ever more precise approximations. 
Binary strings are easier, there is no concept 
"""

def binary_string_to_nat( binstr ):
    if binstr == '0':
        return 2
    elif binstr == '1':
        return 1
    
    leadingzeros = binstr.index('1')
    z = int(binstr[leadingzeros:], 2)
    factors = push_prime_factors(prime_factors(z))
    factors[2] = leadingzeros
    
    return factorsToInt(factors)

def nat_to_binary_string( n ):
    if n == 1:
        return '1'
    if n == 2:
        return '0'
    
    zeros, factors = pull_prime_factors(prime_factors(n))
    return ('0' * zeros) + bin(factorsToInt(factors))[2:]

passed = True
bss = []
for i in range(10000):
    bs = nat_to_binary_string(i)
    print( f"{i} : {bs}" )
    if bs in bss:
        print(f"Failed for uniqueness on {bs} for {i}")
        passed = False

# two dimensions counting... both could be infinite
# this IS what makes it uncountable... this is it's cardinality exposed
ns = []
for i in range(10):
    for j in range(1,10000):
        bs = ('0' * i) + bin(j)[2:]
        n = binary_string_to_nat(bs)
        print(f"{bs} : bin natural {bin(n)}\tnatural {n}" )
        if n in ns:
            print(f"Failed for uniqueness on {n} for {bs}")
            passed = False
if passed:
    print("Passed all tests")
else:
    print("Failed for unique mapping")

""""
# TESTS CASES FOR RATIONAL TO NATURAL USING THE SAME METHOD
# Similar to the above, this works for all finit precision numbers
# So you'll get one for any precision of irrational number you require 
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
"""

