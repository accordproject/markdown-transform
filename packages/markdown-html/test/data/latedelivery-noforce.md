# HELLO! This is the contract editor. 

And below is a **clause**.

``` <clause src="https://templates.accordproject.org/archives/latedeliveryandpenalty@0.15.0.cta" name="87721b95-7e43-4441-82c7-b4d4db207e6f">
Late Delivery and Penalty.
----

In case of delayed delivery<if id="forceMajeure" value="" whenTrue="%20except%20for%20Force%20Majeure%20cases%2C" whenFalse=""/><variable id="seller" value="%22Dan%22"/> (the Seller) shall pay to <variable id="buyer" value="%22Steve%22"/> (the Buyer) for every <variable id="penaltyDuration" value="2%20days"/>
of delay penalty amounting to <variable id="penaltyPercentage" value="10.5"/>% of the total value of the Equipment
whose delivery has been delayed. Any fractional part of a <variable id="fractionalPart" value="days"/> is to be
considered a full <variable id="fractionalPart" value="days"/>. The total amount of penalty shall not however,
exceed <variable id="capPercentage" value="55.0"/>% of the total value of the Equipment involved in late delivery.
If the delay is more than <variable id="termination" value="15%20days"/>, the Buyer is entitled to terminate this Contract.
```