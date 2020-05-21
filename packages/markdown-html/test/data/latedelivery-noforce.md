# HELLO! This is the contract editor. 

And below is a **clause**.

``` <clause src="https://templates.accordproject.org/archives/latedeliveryandpenalty@0.15.0.cta" name="87721b95-7e43-4441-82c7-b4d4db207e6f">
Late Delivery and Penalty.
----

In case of delayed delivery<if name="forceMajeure" value="" whenTrue="%20except%20for%20Force%20Majeure%20cases%2C" whenFalse=""/><variable name="seller" value="%22Dan%22"/> (the Seller) shall pay to <variable name="buyer" value="%22Steve%22"/> (the Buyer) for every <variable name="penaltyDuration" value="2%20days"/>
of delay penalty amounting to <variable name="penaltyPercentage" value="10.5"/>% of the total value of the Equipment
whose delivery has been delayed. Any fractional part of a <variable name="fractionalPart" value="days"/> is to be
considered a full <variable name="fractionalPart" value="days"/>. The total amount of penalty shall not however,
exceed <variable name="capPercentage" value="55.0"/>% of the total value of the Equipment involved in late delivery.
If the delay is more than <variable name="termination" value="15%20days"/>, the Buyer is entitled to terminate this Contract.
```